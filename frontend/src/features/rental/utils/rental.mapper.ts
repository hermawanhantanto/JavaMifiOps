import type { RentalStatus } from '../types/rental.types';

/**
 * Formats a numeric currency value into Indonesian Rupiah format without decimals.
 * Example: 150000 -> "Rp 150.000"
 */
export function formatRentalCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Maps raw backend rental status enums to human-friendly display labels.
 */
export function formatRentalStatus(status: RentalStatus | string): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Pending Payment';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'ACTIVE':
      return 'Active';
    case 'RETURNED':
      return 'Returned';
    case 'OVERDUE':
      return 'Overdue';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'Unknown';
  }
}

/**
 * Returns clean Tailwind badge color styling corresponding to rental status.
 */
export function getRentalStatusClasses(status: RentalStatus | string): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
    case 'ACTIVE':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25';
    case 'RETURNED':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25';
    case 'OVERDUE':
      return 'bg-destructive/10 text-destructive border-destructive/25';
    case 'CANCELLED':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
}

/**
 * Formats an ISO date string to a concise date representation (e.g. "21 Oct 2026").
 */
export function formatRentalDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats a start and end date range along with duration in days.
 * Example: "21 Oct 2026 – 25 Oct 2026 (5 days)"
 */
export function formatRentalDateRange(
  startStr: string | Date,
  endStr: string | Date,
  totalDays?: number
): string {
  const start = formatRentalDate(startStr);
  const end = formatRentalDate(endStr);

  if (totalDays !== undefined && totalDays > 0) {
    const dayLabel = totalDays === 1 ? '1 day' : `${totalDays} days`;
    return `${start} – ${end} (${dayLabel})`;
  }

  return `${start} – ${end}`;
}
