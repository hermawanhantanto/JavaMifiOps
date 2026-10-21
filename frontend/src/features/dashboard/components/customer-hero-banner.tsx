import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RentalItem } from '@/features/rental/types/rental.types';
import { formatRentalDateRange } from '@/features/rental/utils/rental.mapper';
import { formatDeviceSpeed } from '@/features/device/utils/device.mapper';
import { MapPin } from 'lucide-react';

export interface CustomerHeroBannerProps {
  activeRental: RentalItem | null;
  isLoading?: boolean;
}

/**
 * Minimalist active travel status strip.
 * Appears only when the customer has an active or confirmed trip in progress.
 */
export function CustomerHeroBanner({
  activeRental,
  isLoading = false,
}: CustomerHeroBannerProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card p-4 sm:p-5 shadow-none">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
      </Card>
    );
  }

  // Active or Confirmed Wi-Fi trip in progress
  if (activeRental) {
    const isOngoing = activeRental.status === 'ACTIVE';

    return (
      <Card className="border-border bg-card shadow-none">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {isOngoing ? 'Active Trip' : 'Confirmed Trip'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-foreground">
              <span className="font-semibold text-sm">
                {activeRental.device?.model ?? 'Pocket WiFi'}
              </span>
              {activeRental.device?.speed && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted font-medium">
                  {formatDeviceSpeed(activeRental.device.speed)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <MapPin className="size-3 text-primary" />
                {activeRental.destination}
              </span>
              <span>•</span>
              <span className="font-mono">
                {formatRentalDateRange(activeRental.startDate, activeRental.endDate)}
              </span>
              <span>•</span>
              <span>{activeRental.totalDays} day{activeRental.totalDays > 1 ? 's' : ''}</span>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium self-start sm:self-auto">
            <Link to="/rental">Manage Booking</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // When no active trip, do not render any promotional or payment banner
  return null;
}
