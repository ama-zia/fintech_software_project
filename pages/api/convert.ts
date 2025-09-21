import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const from = String(req.query.from || "USD").toUpperCase();
  const to = String(req.query.to || "USD").toUpperCase();
  const amount = Number(req.query.amount ?? 1);

  const API_KEY = process.env.FREECURRENCYAPI_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing API key." });
  }

  try {
    const r = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${to}&base_currency=${from}`
    );
    const json = await r.json();

    if (json.data && json.data[to]) {
      const rate = json.data[to];
      const result = amount * rate;
      res.status(200).json({ result, rate, from, to });
    } else {
      console.error("Currency API error:", json);
      res.status(500).json({ error: "Invalid response from currency API." });
    }
  } catch (err) {
    console.error("convert API error:", err);
    res.status(500).json({ error: "Failed to fetch conversion rate." });
  }
}
