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
 * forecast(transactions, options)
 * - transactions: array of transactions (date, amount)
 * - days: how many future days to simulate
 * - scenario: optional multiplier map category->multiplier to modify transactions before forecasting
 *
 * returns { points: ForecastPoint[], runs?: number[][], meta: { ... } }
 */
export async function forecast(transactions: Transaction[], days = 365, scenario?: ScenarioDelta) {
  // 1) apply scenario multipliers (simple category multiplier)
  const txs = transactions.map(t => {
        // Ensure all amounts are treated as positive initially for consistency
        let amount = Math.abs(t.amount);
        
        // Apply the scenario delta to the raw amount
        if (scenario && t.category && (t.category in scenario)) {
            amount = amount * (scenario[t.category] ?? 1);
        }

        // Treat "Income" or "Salary" as positive, all others as negative
        const isIncome = t.category && ["Income", "Salary"].includes(t.category);
        const finalAmount = isIncome ? amount : -amount;

        return { ...t, amount: finalAmount };
    });

  // compute avgMonthly (past) using min/max dates from txs
  let avgMonthly = 0;
  if (txs.length > 0) {
    // ensure we parse dates and find min/max
    const dates = txs.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    // months span (inclusive)
    const months = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth() + 1));
    const total = txs.reduce((s, tx) => s + tx.amount, 0);
    avgMonthly = total / months;
  }

  // 2) build daily series map and sort by day
  const map = buildDailySeriesFromTransactions(txs);
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

  // convert to arrays for numerical ops
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
  const residMean = residuals.reduce((a,b)=>a+b,0)/residuals.length;
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
      // sample residual noise
     // clamp noise to ±3σ
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

  // projectedMonthly: average of first 30 median days (if available)
  const first30 = points.slice(0, 30);
  const dailyAvg = first30.reduce((s,p)=>s + (p.median ?? 0), 0) / first30.length;
  const projectedMonthly = dailyAvg * 30; // approximate monthly

  return {
    points,
    meta: {
      slope,
      intercept,
      residStd,
      residualCount: residuals.length,
      avgMonthly,
      projectedMonthly
    }
  };
}
