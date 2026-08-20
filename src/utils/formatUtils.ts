/**
 * Numeric and currency formatting utilities
 * Standard format: thousands with commas and two decimals (e.g. 1,250.00) without currency symbols ($ or L)
 */

export function formatAmount(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '0.00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseAmount(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
