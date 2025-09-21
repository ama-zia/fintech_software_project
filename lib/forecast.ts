// lib/forecast.ts
import { Transaction, ScenarioDelta } from "../types";

type SeriesPoint = { date: string; value: number };
export type ForecastPoint = { date: string; median: number; lower: number; upper: number };

function parseDateOnly(d: string) {
  const t = new Date(d);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function formatDate(d: Date) {
  return d.toISOString().slice(0,10);
}

// Build daily series map from transactions (sum amounts per day)
export function buildDailySeriesFromTransactions(transactions: Transaction[]) : Record<string, number> {
  const map: Record<string, number> = {};
  transactions.forEach(t => {
    const day = formatDate(parseDateOnly(t.date));
    map[day] = (map[day] || 0) + t.amount;
  });
  return map;
}

// Simple linear regression to detect trend
function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const meanX = xs.reduce((a,b)=>a+b,0)/n;
  const meanY = ys.reduce((a,b)=>a+b,0)/n;
  let num = 0, den = 0;
  for (let i=0;i<n;i++){
    num += (xs[i]-meanX)*(ys[i]-meanY);
    den += (xs[i]-meanX)*(xs[i]-meanX);
  }
  const slope = den === 0 ? 0 : num/den;
  const intercept = meanY - slope*meanX;
  return { slope, intercept };
}

// Box-Muller for normal samples
function randn(mean=0, std=1) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
}

/**
 * forecast(transactions, days, scenario)
 * - transactions: signed amounts (income positive, expenses negative)
 * - scenario: optional map category -> multiplier (0.0..2.0 etc)
 *
 * returns { points: ForecastPoint[], meta: { avgMonthly, projectedMonthly, ... } }
 */
export async function forecast(transactions: Transaction[], days = 365, scenario?: ScenarioDelta) {
  // defensive copy / ensure amounts are numbers
  const txsOriginal = transactions.map(t => ({ ...t, amount: Number(t.amount || 0) }));

  // ---------- compute historical avgMonthly (baseline) ----------
  let avgMonthly = 0;
  if (txsOriginal.length > 0) {
    const dates = txsOriginal.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const months = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth() + 1));
    const total = txsOriginal.reduce((s,t) => s + t.amount, 0);
    avgMonthly = total / months;
  }

  // ---------- compute baseline monthly per category (for scenario projection) ----------
  const monthsSpan = (() => {
    if (txsOriginal.length === 0) return 1;
    const dates = txsOriginal.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth() + 1));
  })();

  const catTotals: Record<string, number> = {};
  txsOriginal.forEach(t => {
    const cat = (t.category || "__uncategorized").toString().trim();
    catTotals[cat] = (catTotals[cat] || 0) + t.amount;
  });
  const baselineMonthlyByCategory: Record<string, number> = {};
  Object.keys(catTotals).forEach(cat => {
    baselineMonthlyByCategory[cat] = catTotals[cat] / monthsSpan;
  });

  // projectedMonthly by applying scenario multipliers to baselineMonthlyByCategory
  const projectedMonthlyByCategory = Object.keys(baselineMonthlyByCategory).reduce((sum, cat) => {
    const multiplier = scenario && (cat in scenario) ? (scenario as any)[cat] : 1;
    return sum + baselineMonthlyByCategory[cat] * multiplier;
  }, 0);

  // ---------- prepare txsAdjusted (apply scenario multipliers to each transaction) ----------
  // IMPORTANT: do NOT change the sign of t.amount here; CSV should supply signed amounts.
  const txsAdjusted = txsOriginal.map(t => {
    const multiplier = scenario && t.category && (t.category in scenario) ? (scenario as any)[t.category] : 1;
    return { ...t, amount: t.amount * multiplier };
  });

  // ---------- build daily series from adjusted txs for the chart/model ----------
  const map = buildDailySeriesFromTransactions(txsAdjusted);
  const dates = Object.keys(map).sort();

  // if there's no data, return zeros
  if (dates.length === 0) {
    const points: ForecastPoint[] = [];
    const today = new Date();
    for (let i=0;i<days;i++){
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      points.push({ date: formatDate(d), median: 0, lower: 0, upper: 0 });
    }
    return { points, meta: { notes: "no data", avgMonthly: 0, projectedMonthly: 0 } };
  }

  // convert to arrays for numerical ops (daily net flows)
  const values = dates.map(d => map[d]);
  const n = values.length;
  const xs = values.map((_,i) => i);

  // 3) fit linear regression for trend
  const { slope, intercept } = linearRegression(xs, values);

  // 4) weekday seasonality: average residual by weekday
  const weekdaySums: number[] = [0,0,0,0,0,0,0];
  const weekdayCount: number[] = [0,0,0,0,0,0,0];
  for (let i=0;i<n;i++){
    const d = new Date(dates[i]);
    const w = d.getDay();
    const trendAtI = intercept + slope * i;
    const residual = values[i] - trendAtI;
    weekdaySums[w] += residual;
    weekdayCount[w] += 1;
  }
  const weekdayAvg = weekdaySums.map((s,i) => weekdayCount[i] ? s/weekdayCount[i] : 0);

  // 5) compute residuals distribution (after removing trend+seasonality)
  const residuals: number[] = [];
  for (let i=0;i<n;i++){
    const d = new Date(dates[i]);
    const w = d.getDay();
    const pred = intercept + slope * i + weekdayAvg[w];
    residuals.push(values[i] - pred);
  }
  const residMean = residuals.reduce((a,b)=>a+b,0)/Math.max(1,residuals.length);
  const residStd = Math.sqrt(residuals.reduce((a,b)=>a+(b-residMean)*(b-residMean),0)/Math.max(1,residuals.length-1));

  // 6) predictive median (deterministic trend+seasonality) + Monte Carlo sims
  const sims = 300;
  const runs: number[][] = []; // simulations x days
  for (let s=0;s<sims;s++){
    const run: number[] = [];
    for (let i=0;i<days;i++){
      // future index = n + i
      const idx = n + i;
      const base = intercept + slope * idx;
      // weekday for future day
      const futDate = new Date(dates[dates.length-1]);
      futDate.setDate(futDate.getDate() + 1 + i);
      const w = futDate.getDay();
      const seasonal = weekdayAvg[w];
      // sample residual noise, clamp to ±3σ for stability
      const noise = Math.max(Math.min(randn(residMean, residStd), residStd*3), -residStd*3);
      run.push(base + seasonal + noise);
    }
    runs.push(run);
  }

  // compute median and intervals for each day
  const points: ForecastPoint[] = [];
  for (let dayIdx = 0; dayIdx < days; dayIdx++) {
    const vals = runs.map(r => r[dayIdx]).sort((a,b)=>a-b);
    const median = vals[Math.floor(vals.length/2)];
    const lower = vals[Math.floor(vals.length*0.05)];
    const upper = vals[Math.floor(vals.length*0.95)];
    const futDate = new Date(dates[dates.length-1]);
    futDate.setDate(futDate.getDate() + 1 + dayIdx);
    points.push({ date: formatDate(futDate), median, lower, upper });
  }

  // forecast-based projected monthly (MC-driven) — keep for diagnostics
  const first30 = points.slice(0, 30);
  const forecastDailyAvg = first30.length ? (first30.reduce((s,p)=>s + (p.median ?? 0), 0) / first30.length) : 0;
  const forecastProjectedMonthlyMC = forecastDailyAvg * 30;

  // final projectedMonthly for UI: use category-based projection (stable + responsive to sliders)
  const projectedMonthly = projectedMonthlyByCategory;

  return {
    points,
    meta: {
      slope,
      intercept,
      residStd,
      residualCount: residuals.length,
      avgMonthly,
      projectedMonthly,            // responsive, slider-friendly monthly projection
      forecastProjectedMonthlyMC   // MC-based monthly (kept for debugging/inspection)
    }
  };
}
