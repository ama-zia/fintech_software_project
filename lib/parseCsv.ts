export function sanitizeAmount(s: string) {
  return Number(String(s).replace(/[^0-9\.\-]/g, "")) || 0;
}
