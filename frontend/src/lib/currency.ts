/**
 * Currency formatting utility for Sri Lankan Rupee (LKR)
 */
export function formatLKR(amount: number): string {
  const num = Number(amount || 0);
  return `LKR ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
