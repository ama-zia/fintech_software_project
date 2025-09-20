// pages/index.tsx
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import UploadCSV from "../components/UploadCSV";
import TransactionsTable from "../components/TransactionsTable";
import ScenarioPanel from "../components/ScenarioPanel";
import CurrencyConverter from "../components/CurrencyConverter";
import GamifiedSavings from "../components/GamifiedSavings";
import { Transaction, ScenarioDelta } from "../types";
import { buildDailySeriesFromTransactions } from "../lib/forecast";
const ForecastChart = dynamic(() => import("../components/ForecastChart"), { ssr: false });

export default function Home() {
  // DO NOT access localStorage during server render.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forecast, setForecast] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // set mounted and load saved transactions from localStorage on client only
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("txs");
      if (raw) {
        const parsed = JSON.parse(raw) as Transaction[];
        const sane = parsed.filter(p => p?.date && typeof p.amount === "number");
        setTransactions(sane);
      }
    } catch (err) {
      console.warn("Failed to load txs from localStorage", err);
      setTransactions([]);
    }
  }, []);

  // persist locally for convenience (only after mounted)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("txs", JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions, mounted]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.category) set.add(String(t.category).trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Build quick baseline timeseries used on client for some UI pieces (not the authoritative ML)
  const dailySeries = useMemo(() => buildDailySeriesFromTransactions(transactions), [transactions]);

  async function runForecast(days = 365, scenario?: ScenarioDelta) {
    setLoading(true);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify({ transactions, days, scenario })
      });
      const json = await res.json();
      setForecast(json);
    } catch (err) {
      console.error(err);
      alert("Forecast failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 style={{margin:0}}>Financial Health — Digital Twin</h1>
          <div className="small">Upload transactions, build scenarios, and see future outcomes</div>
        </div>
        <div className="controls">
          <CurrencyConverter />
          <button
            className="btn"
            onClick={() => {
              if (!confirm("Clear all uploaded transactions and forecasts?")) return;
              setTransactions([]);
              setForecast(null);
              localStorage.removeItem("txs");
            }}
            style={{marginLeft:8}}
          >
            Clear data
          </button>
        </div>
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <UploadCSV
              onUpload={(rows, opts) => {
                // opts.replace default to true
                const replace = opts?.replace ?? true;
                if (replace) setTransactions(rows);
                else setTransactions(prev => [...rows, ...prev]);
                // reset any existing forecast because data changed
                setForecast(null);
              }}
            />
            <div style={{height:12}} />
            {/* render transactions only on client to avoid hydration mismatch */}
            {mounted && (
                <TransactionsTable transactions={transactions} setTransactions={setTransactions} />
            )}
          </div>

          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <h3 style={{margin:0}}>Forecast</h3>
                <div className="small">Server-side forecast + Monte Carlo uncertainty</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" onClick={() => runForecast()}>Run baseline forecast</button>
                <button className="btn" onClick={() => runForecast(365, undefined)}>365 days</button>
              </div>
            </div>
            <div style={{height:12}} />
            <div style={{minHeight:240}}>
                {mounted && <ForecastChart forecast={forecast} baseline={dailySeries} loading={loading} />}
            </div>
          </div>

        </div>

        <div>
          <div className="card">
            <h3 style={{margin:0}}>Scenario Builder</h3>
            <div className="small">Reduce / increase category spend and re-run forecast</div>
            <div style={{height:12}} />
            <ScenarioPanel categories={categories} onSimulate={(scenario) => runForecast(365, scenario)} />
          </div>

          <div className="card">
            <h3 style={{margin:0}}>Save-to-Goal (Gamified)</h3>
            <div className="small">See how long to reach goals if you save more</div>
            <div style={{height:12}} />
            {mounted && <GamifiedSavings baselineDailySeries={dailySeries} forecast={forecast} />}
          </div>

          <div className="card">
            <h3 style={{margin:0}}>Quick tips</h3>
            <ul className="small">
              <li>Upload CSV with columns: date, amount, description</li>
              <li>Edit categories inline to get better scenarios</li>
              <li>Forecast runs server-side (simple but explainable model)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
