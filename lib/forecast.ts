// lib/forecast.ts
import { Transaction, ScenarioDelta } from "../types";

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
  const txsOriginal = transactions.map(t => ({ ...t, amount: Number(t.amount || 0) }));

  // ---------- compute historical avgMonthly ----------
  let avgMonthly = 0;
  if (txsOriginal.length > 0) {
    const dates = txsOriginal.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const months = Math.max(
      1,
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth() + 1)
    );
    const total = txsOriginal.reduce((s,t) => s + t.amount, 0);
    avgMonthly = total / months;
  }

  // ---------- compute baseline monthly per category ----------
  const monthsSpan = (() => {
    if (txsOriginal.length === 0) return 1;
    const dates = txsOriginal.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return Math.max(
      1,
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth() + 1)
    );
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

  // projectedMonthly by applying scenario multipliers
  const projectedMonthlyByCategory = Object.keys(baselineMonthlyByCategory).reduce((sum, cat) => {
    const multiplier = scenario && (cat in scenario) ? (scenario as any)[cat] : 1;
    return sum + baselineMonthlyByCategory[cat] * multiplier;
  }, 0);

  // ---------- apply scenario multipliers ----------
  const txsAdjusted = txsOriginal.map(t => {
    const multiplier = scenario && t.category && (t.category in scenario) ? (scenario as any)[t.category] : 1;
    return { ...t, amount: t.amount * multiplier };
  });

  // ---------- build daily net flow ----------
  const map = buildDailySeriesFromTransactions(txsAdjusted);
  const dates = Object.keys(map).sort();

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

  // ---------- convert to cumulative balance ----------
  const dailyValues = dates.map(d => map[d]);
  const cumulative: number[] = [];
  dailyValues.reduce((acc, val) => {
    const newVal = acc + val;
    cumulative.push(newVal);
    return newVal;
  }, 0);

  const lastKnownBalance = cumulative[cumulative.length - 1];

  // ---------- residual stats for noise ----------
  const mean = cumulative.reduce((a,b)=>a+b,0) / cumulative.length;
  const std = Math.sqrt(cumulative.reduce((a,b)=>a+(b-mean)*(b-mean),0) / Math.max(1, cumulative.length-1));

  // ---------- Monte Carlo sims on cumulative ----------
  const sims = 300;
  const runs: number[][] = [];
  for (let s=0;s<sims;s++){
    const run: number[] = [];
    let bal = lastKnownBalance;
    for (let i=0;i<days;i++){
      // approximate daily drift = avgMonthly/30
      const dailyDrift = projectedMonthlyByCategory / 30;
      const noise = Math.max(Math.min(randn(0,std/10), std), -std);
      bal = bal + dailyDrift + noise;
      run.push(bal);
    }
    runs.push(run);
  }

  // ---------- compute quantiles ----------
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

  // forecast-based projected monthly (for diagnostics)
  const first30 = points.slice(0, 30);
  const forecastDailyAvg = first30.length
    ? (first30.reduce((s,p)=>s + (p.median ?? 0), 0) / first30.length)
    : 0;
  const forecastProjectedMonthlyMC = forecastDailyAvg * 30;

  return {
    points,
    meta: {
      avgMonthly,
      projectedMonthly: projectedMonthlyByCategory,
      forecastProjectedMonthlyMC
    }
  };
}
