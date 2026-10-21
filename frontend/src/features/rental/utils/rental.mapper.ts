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
 * Returns Tailwind badge classes consistent with DeviceStatusBadge styling.
 */
export function getRentalStatusVariant(status: RentalStatus | string): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'ACTIVE':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    case 'RETURNED':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'OVERDUE':
      return 'bg-destructive/10 text-destructive border-destructive/20';
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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats start and end dates compactly.
 * Example: "21 Oct – 25 Oct 2026"
 */
export function formatRentalDateRange(
  startStr: string | Date,
  endStr: string | Date
): string {
  if (!startStr || !endStr) return '-';
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

  const startDay = start.getDate();
  const startMonth = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(start);
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(end);
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startDay} ${startMonth} ${startYear}`;
      }
      return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Maps raw backend fulfillment type to human-readable label.
 */
export function formatFulfillmentType(type?: string | null): string {
  switch (type) {
    case 'AIRPORT_PICKUP':
      return 'Airport Pickup';
    case 'HOME_DELIVERY':
      return 'Home Delivery';
    default:
      return type || 'Airport Pickup';
  }
}
