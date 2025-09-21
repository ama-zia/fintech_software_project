# 💸 Financial Health Digital Twin

A personal finance dashboard built with **Next.js + TypeScript + React**, designed to let users:

- Upload their transactions  
- Forecast future balances  
- Simulate “what if” scenarios  
- Visualize savings goals  

Think of it as your **financial twin** that shows what could happen if you tweak your spending habits.

This project demonstrates **full-stack engineering**, modular React components, server-side computation, and interactive scenario simulation—all in a clean, type-safe codebase.

---

## 🚀 Features

### 📂 Upload CSV Transactions
- Drag & drop your CSV or select a file.  
- Example CSV:
  ```csv
  date,amount,description,category
  2024-01-01,-4.5,Starbucks,Coffee
  2024-01-02,-30,Groceries,Groceries
  2024-01-05,2000,Salary,Income
Negative = spending, Positive = income.

Transactions appear in a table where you can edit categories or delete rows.

📊 Transactions Table
Edit categories inline (e.g., coffee, groceries, rent).

Categories feed directly into the Scenario Builder.

🔮 Forecast
Predict your future balance based on past spending.

Median prediction (most likely outcome)

90% uncertainty band (Monte Carlo simulation)

Break-even line

Simple, explainable trend + seasonality model

🎛 Scenario Builder
Adjust category spend with sliders.

Simulate “what if” scenarios: reduce coffee by 50%, increase rent, etc.

Forecast updates instantly to reflect the new scenario.

🎯 Gamified Savings Goals
Predefined goals:

Laptop ($2000)

Car down payment ($5000)

House down payment ($20,000)

Shows months to reach goals based on projected savings.

If projected monthly savings are 0 or negative, shows “—” instead of fake numbers. ✅

Updates automatically when scenario sliders are changed.

💱 Currency Converter
Convert any amount between currencies using live FreeCurrencyAPI rates.

Simple interface:

Copy code
100 USD → GBP
Supports dozens of currencies (USD, EUR, GBP, CAD, AUD, JPY, INR, etc.).

🛠 Tech Stack
Frontend: React + Next.js + TypeScript

Charting: Recharts

CSV parsing: PapaParse

Server-side computation: Next.js API routes

Forecasting logic: Linear trend + weekday seasonality + Monte Carlo simulation (modular TS code)

Styling: CSS with custom variables, clean dashboard layout

Hosting: Ready for Vercel deployment

Design Principles:

Type-safe data structures (types.ts)

Modular components (components/)

Clear separation of UI and logic (lib/forecast.ts)

Explainable algorithms (swappable with Prophet/TensorFlow later)

🏗 Project Structure
pgsql
Copy code
financial-digital-twin/
├── pages/                   # UI screens + API routes
│   ├── index.tsx            # Main dashboard
│   ├── _app.tsx             # App wrapper
│   └── api/
│       ├── forecast.ts      # Server-side forecasting
│       └── convert.ts       # Currency API proxy
├── components/              # Reusable React components
│   ├── CurrencyConverter.tsx
│   ├── ForecastChart.tsx
│   ├── GamifiedSavings.tsx  # ✅ Fixed to show "—" when no savings
│   ├── ScenarioPanel.tsx
│   └── TransactionsTable.tsx
├── lib/                     # Forecast engine + helpers
│   ├── forecast.ts
│   └── parseCsv.ts
├── styles/                  # CSS styles
├── types.ts                 # TypeScript types
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript settings
└── next.config.js           # Next.js config
💻 How to Run Locally
Clone the repo:

bash
Copy code
git clone <your-repo-url>
cd financial-digital-twin
Install dependencies:

bash
Copy code
npm install
Start development server:

bash
Copy code
npm run dev
Open http://localhost:3000 in your browser.

Upload CSV, edit categories, run Forecast, and play with Scenario Builder + Gamified Savings.

