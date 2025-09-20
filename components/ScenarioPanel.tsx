import { useMemo, useState, useEffect } from "react";
import { ScenarioDelta } from "../types";

export default function ScenarioPanel({ categories = [], onSimulate }: { categories: string[], onSimulate: (scenario: ScenarioDelta) => void }) {
  // default multipliers 1.0
  const [deltas, setDeltas] = useState<ScenarioDelta>(() => {
    const out: ScenarioDelta = {};
    categories.forEach(c => out[c] = 1);
    return out;
  });

  // keep deltas in sync if categories change
  const synced = useMemo(() => {
    const out: ScenarioDelta = {...deltas};
    categories.forEach(c => { if (!(c in out)) out[c] = 1; });
    Object.keys(out).forEach(k => { if (!categories.includes(k)) delete out[k]; });
    return out;
  }, [categories, deltas]);

  // 🔥 ADDED useEffect hook to apply the synced deltas
  useEffect(() => {
    setDeltas(synced);
  }, [synced]);

  // slider helper
  function onChangeCategory(cat: string, value: number) {
    // value is 0-2 (0%-200%), store directly
    setDeltas(prev => ({ ...prev, [cat]: value }));
  }

  return (
    <div>
      <div className="small">Drag to reduce spend. 0.5 = 50% of current spend.</div>
      <div style={{height:8}} />
      {categories.length === 0 && <div className="small">No categories yet — add categories in the transactions table.</div>}
      {categories.map(cat => (
        <div key={cat} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><strong>{cat}</strong></div>
            <div className="small">{Math.round((deltas[cat] ?? 1) * 100)}%</div>
          </div>
          <input className="slider" type="range" min="0" max="200" step="1" value={Math.round((deltas[cat] ?? 1) * 100)} onChange={(e)=>onChangeCategory(cat, Number(e.target.value)/100)} />
        </div>
      ))}

      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button className="btn" onClick={()=>onSimulate(deltas)}>Simulate scenario &rarr;</button>
        <button className="input" onClick={()=>{ const reset: ScenarioDelta = {}; categories.forEach(c=>reset[c]=1); setDeltas(reset); }}>Reset</button>
      </div>
    </div>
  );
}