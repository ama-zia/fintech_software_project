import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useMemo } from "react";

function fmtMoney(v: number) {
  return (Math.round(v*100)/100).toLocaleString();
}

export default function ForecastChart({ forecast, baseline, loading } : { forecast:any, baseline: Record<string,number>, loading:boolean }) {
  // forecast format: { points: [{date, median, lower, upper}], runs: ... }
  const data = useMemo(() => {
    if (!forecast || !forecast.points) {
      // fallback to baseline last 90 days
      const arr = Object.entries(baseline).slice(-90).map(([date, val]) => ({ date, value: val }));
      return arr;
    }
    return forecast.points.map((p: any) => ({ date: p.date, median: p.median, lower: p.lower, upper: p.upper }));
  }, [forecast, baseline]);

  if (typeof window === "undefined") return null; // avoid SSR rendering
  if (loading) return <div className="small">Forecast running — give it a few seconds...</div>;
  if (!data || data.length === 0) return <div className="small">No data</div>;

  return (
    <div style={{height:320}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBand" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02}/>
            </linearGradient>
          </defs>

          <XAxis dataKey="date" tick={{fontSize:12}} minTickGap={20}/>
          <YAxis tickFormatter={(v)=>fmtMoney(Number(v))} />
          <Tooltip formatter={(v:any)=>[Number(v).toFixed(2),"USD"]} />
          <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#colorBand)" />
          <Area type="monotone" dataKey="lower" stroke="transparent" fill="url(#colorBand)" />
          <Area type="monotone" dataKey="median" stroke="#7c3aed" fill="url(#colorMedian)" dot={false} />
          <ReferenceLine y={0} stroke="#ffffff10" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
