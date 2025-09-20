import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const from = String(req.query.from || "USD").toUpperCase();
  const to = String(req.query.to || "USD").toUpperCase();
  const amount = Number(req.query.amount ?? 1);

  // Free Currency API key (you would typically store this in an environment variable)
  const API_KEY = "fca_live_90t5v5v1e9e0v3c3b0v5b9v1c9v5b9b1e9t9b1b4";
  
  try {
    const r = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${to}&base_currency=${from}`);
    const json = await r.json();
    
    // Check if the API response is valid and contains the conversion rate
    if (json.data && json.data[to]) {
      const rate = json.data[to];
      const result = amount * rate;
      res.status(200).json({ result });
    } else {
      console.error("Currency API error: Invalid response data", json);
      res.status(200).json({ result: amount }); // Fallback to original amount on error
    }
  } catch (err) {
    console.error("convert API error:", err);
    res.status(500).json({ error: "Failed to fetch conversion rate." });
  }
}