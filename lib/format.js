export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(2);
  return `${formatted} €`;
}
