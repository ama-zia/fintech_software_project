import { useState } from "react";

export default function CurrencyConverter() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("100");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

    async function convert() {
        setLoading(true);
        setOut(null);
        try {
        // ensure uppercase codes
        const fromCode = (from || "USD").toUpperCase();
        const toCode = (to || "USD").toUpperCase();
        const amt = Number(amount) || 0;
        const res = await fetch(`/api/convert?from=${fromCode}&to=${toCode}&amount=${amt}`);
        const json = await res.json();
        // api returns { result: number } per our convert.ts
        const resultNum = (json && typeof json.result === "number") ? json.result : null;
        if (resultNum == null) {
            setOut("error");
        } else {
            // format nicely with 2 decimals
            setOut(resultNum.toFixed(2));
        }
        } catch (err) {
        console.error("convert error", err);
        setOut("error");
        } finally {
        setLoading(false);
        }
    }




  return (
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <input className="input" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{width:100}} />
      <input className="input" value={from} onChange={(e)=>setFrom(e.target.value)} style={{width:60}} />
      <div style={{fontSize:18}}>→</div>
      <input className="input" value={to} onChange={(e)=>setTo(e.target.value)} style={{width:60}} />
      <button className="btn" onClick={convert} disabled={loading}>Convert</button>
      <div className="small">{out ?? ""}</div>
    </div>
  );
}
