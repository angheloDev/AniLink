/** ₱1,280 style amounts, as used throughout the app. */
export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-US')}`;
}
