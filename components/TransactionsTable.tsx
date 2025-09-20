import { Transaction } from "../types";

export default function TransactionsTable({
  transactions,
  setTransactions
}: {
  transactions: Transaction[];
  setTransactions: (t: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
}) {
  function update(id: string, patch: Partial<Transaction>) {
    setTransactions(prev => prev.map(p => p.id === id ? {...p, ...patch} : p));
  }
  function remove(id: string) {
    if (!confirm("Delete transaction?")) return;
    setTransactions(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <h3 style={{marginTop:0}}>Transactions ({transactions.length})</h3>
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td className="kv">{t.date}</td>
              <td>{t.description}</td>
              <td>
                <input className="input" value={t.category || ""} onChange={(e)=>update(t.id,{category:e.target.value})} placeholder="category"/>
              </td>
              <td className="kv">{t.amount.toFixed(2)}</td>
              <td><button style={{background:"transparent",color:"var(--muted)",border:"none",cursor:"pointer"}} onClick={()=>remove(t.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
