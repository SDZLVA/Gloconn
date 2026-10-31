/**
 * "€1,234" — whole amounts in a currency. Plain module (not "use client"),
 * so server pages can call it too (Milestone 33b: calling a function from a
 * "use client" file on the server crashed the hotel page).
 */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}
