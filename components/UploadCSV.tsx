// components/UploadCSV.tsx
import Papa from "papaparse";
import { useRef, useState } from "react";
import { Transaction } from "../types";
import { sanitizeAmount } from "../lib/parseCsv";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

function normalizeRow(row: any, flipPositive = false): Transaction | null {
  // Accept common named columns: date, amount, description, category
  const date = row.date || row.Date || row.transaction_date || row["Transaction Date"];
  const rawAmount = row.amount || row.Amount || row.AMOUNT || row.value || row.Value;
  if (!date || rawAmount == null) return null;
  let amount = sanitizeAmount(rawAmount);
  // optional flip: if user chooses to flip POSITIVE non-income rows into negative expenses
  if (flipPositive) {
    const incomeRegex = /income|salary|pay|deposit|credit/i;
    const desc = (row.description || row.Description || "").toString();
    const cat = (row.category || row.Category || "").toString();
    const isIncome = incomeRegex.test(desc) || incomeRegex.test(cat);
    if (!isIncome && amount > 0) amount = -Math.abs(amount);
  }
  return {
    id: createId(),
    date: new Date(date).toISOString().slice(0,10),
    amount,
    description: (row.description || row.Description || row.memo || row.Memo || "").toString(),
    category: (row.category || row.Category || "").toString().trim()
  };
}

export default function UploadCSV({ onUpload }: { onUpload: (rows: Transaction[], opts?: { replace?: boolean, flipPositive?: boolean }) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [replace, setReplace] = useState(true);
  const [flipPositive, setFlipPositive] = useState(false);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <strong>Upload CSV</strong>
          <div className="small">Transactions CSV (date, amount, description)</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input ref={fileRef} className="input" type="file" accept=".csv" />
          <button
            className="btn"
            onClick={() => {
              const file = fileRef.current?.files?.[0];
              if (!file) return alert("Choose a CSV file first");
              Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (res) => {
                  const rows: Transaction[] = [];
                  (res.data as any[]).forEach(r => {
                    const t = normalizeRow(r, flipPositive);
                    if (t) rows.push(t);
                  });
                  if (rows.length === 0) return alert("No valid rows found.");
                  // Let parent component decide whether to replace or append
                  onUpload(rows, { replace, flipPositive });
                }
              });
            }}
          >
            Upload
          </button>
        </div>
      </div>

      <div style={{display:"flex",gap:12,marginTop:8,alignItems:"center"}}>
        <label style={{display:"flex",gap:6,alignItems:"center"}} className="small">
          <input type="checkbox" checked={replace} onChange={(e)=>setReplace(e.target.checked)} /> Replace existing data
        </label>
        <label style={{display:"flex",gap:6,alignItems:"center"}} className="small">
          <input type="checkbox" checked={flipPositive} onChange={(e)=>setFlipPositive(e.target.checked)} /> Flip positive amounts for non-income rows
        </label>
      </div>

      <div style={{marginTop:8}} className="small">Tip: check "Replace existing data" to overwrite the previous upload. Use "Flip positive amounts" only if your bank exported expenses as positive numbers (not common, but some CSVs do).</div>
    </div>
  );
}
