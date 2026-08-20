export function severityFromScore(score) {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}
