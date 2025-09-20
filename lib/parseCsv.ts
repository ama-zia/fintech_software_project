// lib/parseCsv.ts
export function sanitizeAmount(s: string) {
  if (s == null) return 0;
  const str = String(s).trim();
  if (str === "") return 0;
  // parentheses like (50.00) -> negative
  const hasParen = /^\(.*\)$/.test(str);
  // leading minus
  const hasMinus = /^-/.test(str);
  // remove currency symbols, spaces, thousands separators and parentheses
  const cleaned = str.replace(/[,\s£$€]/g, "").replace(/[()]/g, "");
  const num = Number(cleaned);
  if (isNaN(num)) return 0;
  return (hasParen || hasMinus) ? -Math.abs(num) : num;
}
