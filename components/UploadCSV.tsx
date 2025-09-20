import Papa from "papaparse";
import { useRef } from "react";
import { Transaction } from "../types";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

function normalizeRow(row: any): Transaction | null {
  // Accept common named columns: date, amount, description, category
  const date = row.date || row.Date || row.transaction_date || row["Transaction Date"];
  const rawAmount = row.amount || row.Amount || row.AMOUNT || row.value;
  if (!date || !rawAmount) return null;
  const amount = Math.abs(Number(String(rawAmount).replace(/[^0-9\.\-]/g, "")) || 0);
  return {
    id: createId(),
    date: new Date(date).toISOString().slice(0,10),
    amount,
    description: row.description || row.Description || row.memo || "",
    category: row.category || ""
  };
}

export default function UploadCSV({ onUpload }: { onUpload: (rows: Transaction[]) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <strong>Upload CSV</strong>
          <div className="small">Transactions CSV (date, amount, description)</div>
        </div>
        <div style={{display:"flex",gap:8}}>
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
                    const t = normalizeRow(r);
                    if (t) rows.push(t);
                  });
                  if (rows.length === 0) return alert("No valid rows found.");
                  onUpload(rows);
                }
              });
            }}
          >
            Upload
          </button>
        </div>
      </div>
      <div style={{marginTop:8}} className="small">Tip: export transactions from your bank as CSV and upload (sandbox data only)</div>
    </div>
  );
}
