import type { NextApiRequest, NextApiResponse } from "next";
import { forecast } from "../../lib/forecast";
import { Transaction, ScenarioDelta } from "../../types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const body = req.body as { transactions?: Transaction[]; days?: number; scenario?: ScenarioDelta };
    const transactions = body.transactions ?? [];
    const days = body.days ?? 365;
    const scenario = body.scenario;
    const result = await forecast(transactions, days, scenario);
    res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: String(err?.message ?? err) });
  }
}
