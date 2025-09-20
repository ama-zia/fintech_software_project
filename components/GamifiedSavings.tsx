import { useMemo } from "react";
import { ForecastPoint } from "../lib/forecast";
import { Transaction } from "../types";

// pre-defined goals (USD)
const GOALS = [
  { id: "bike", name: "High-end laptop", cost: 2000 },
  { id: "car", name: "Used car down payment", cost: 5000 },
  { id: "home", name: "House down payment (starter)", cost: 20000 }
];

function computeAvgMonthlyFromSeries(series: Record<string,number>) {
  const dates = Object.keys(series).sort();
  if (dates.length === 0) return 0;
  const values = Object.values(series);
  // total over series
  const total = values.reduce((a,b)=>a+b,0);
  // compute months span between min and max date
  const minDate = new Date(dates[0]);
  const maxDate = new Date(dates[dates.length-1]);
  const months = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth() + 1));
  return total / months;
}

export default function GamifiedSavings({ baselineDailySeries, forecast }: { baselineDailySeries: Record<string,number>, forecast:any }) {
  // Prefer avgMonthly from server forecast.meta if available
  const serverAvgMonthly = forecast?.meta?.avgMonthly;
  const avgMonthly = useMemo(() => {
    if (typeof serverAvgMonthly === "number") return serverAvgMonthly;
    return computeAvgMonthlyFromSeries(baselineDailySeries);
  }, [baselineDailySeries, serverAvgMonthly]);

  // projected monthly from server if available else fallback to avg of first 30 days * 30
        const projectedMonthly = useMemo(() => {
        if (forecast?.meta?.projectedMonthly != null) return forecast.meta.projectedMonthly;
        if (!forecast || !forecast.points) return avgMonthly;
        const first30 = forecast.points.slice(0,30);
        const dailyAvg = first30.reduce((s:any,p:any)=>s + (p.median ?? 0), 0) / first30.length;
        return dailyAvg * 30; // monthly projection
    }, [forecast, avgMonthly]);


  // monthly saving improvement (if projectedMonthly > avgMonthly)
  const deltaMonthly = projectedMonthly - avgMonthly;

  return (
    <div>
      <div className="small">Avg monthly (past): <strong>{Number(avgMonthly || 0).toFixed(2)} USD</strong></div>
      <div className="small">Projected monthly (next month): <strong>{Number(projectedMonthly || 0).toFixed(2)} USD</strong></div>
      <div style={{height:8}} />
      <div className="small"><strong>If you increase monthly savings by {Number(deltaMonthly || 0).toFixed(2)} USD:</strong></div>
      <div style={{height:8}} />
      {GOALS.map(g => {
        const months = deltaMonthly > 1e-6 ? Math.ceil(g.cost / deltaMonthly) : Infinity;
        return (
          <div key={g.id} className="goal">
            <div>
              <div style={{fontWeight:700}}>{g.name}</div>
              <div className="small">{g.cost.toLocaleString()} USD</div>
            </div>
            <div>
              <div style={{textAlign:"right"}}>{Number.isFinite(months) ? `${months} months` : "—"}</div>
            </div>
          </div>
        );
      })}
      <div style={{height:8}} />
      <div className="small">Tip: use the Scenario Builder to increase projected monthly savings and re-run forecast.</div>
    </div>
  );
}
