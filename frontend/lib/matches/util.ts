// Score may be 0-1 or 0-100 depending on the API; normalise to a 0-100 integer.
export function toPercent(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null;
  const pct = score <= 1 ? score * 100 : score;
  return Math.round(pct);
}