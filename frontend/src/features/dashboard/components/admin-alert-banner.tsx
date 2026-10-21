import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { AdminDashboardRentalStats } from '../types/dashboard.types';

export interface AdminAlertBannerProps {
  rentalStats: AdminDashboardRentalStats;
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering administrative operational action alerts.
 * Displays callouts only when urgent shipments or overdue returns require admin action.
 * Returns null when operations are healthy to keep the dashboard clean and minimalist.
 */
export function AdminAlertBanner({
  rentalStats,
  isLoading = false,
}: AdminAlertBannerProps) {
  if (isLoading) {
    return null;
  }

  const { pendingDispatchCount, overdueRentalsCount } = rentalStats;
  const hasUrgentAction = pendingDispatchCount > 0 || overdueRentalsCount > 0;

  if (!hasUrgentAction) {
    return null;
  }

  const alertParts: string[] = [];
  if (pendingDispatchCount > 0) {
    alertParts.push(
      `${pendingDispatchCount} order${pendingDispatchCount > 1 ? 's' : ''} awaiting dispatch`
    );
  }
  if (overdueRentalsCount > 0) {
    alertParts.push(
      `${overdueRentalsCount} device${overdueRentalsCount > 1 ? 's' : ''} overdue for return`
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle className="size-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Operational Attention Required
          </h4>
          <p className="text-xs text-muted-foreground">
            {alertParts.join(' and ')}. Process shipments and inspection check-ins.
          </p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 text-xs font-medium border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shrink-0 self-start sm:self-auto gap-1"
      >
        <Link to="/rental">
          <span>Manage Orders</span>
          <ArrowRight className="size-3" />
        </Link>
      </Button>
    </div>
  );
}

