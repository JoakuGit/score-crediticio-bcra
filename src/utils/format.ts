export const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('es-AR')}`;

export function formatPeriod(period: string) {
  if (!/^\d{6}$/.test(period)) return period;
  return `${period.slice(4)}/${period.slice(0, 4)}`;
}
