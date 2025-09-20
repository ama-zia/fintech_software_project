export type Transaction = {
  id: string;
  date: string;      // ISO date yyyy-mm-dd
  amount: number;    // negative = outflow, positive = inflow
  description?: string;
  category?: string;
  currency?: string;
};

export type ScenarioDelta = {
  // map category -> multiplier (e.g. coffee: 0.5 means reduce coffee to 50%)
  [category: string]: number;
};
