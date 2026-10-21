import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminDashboardFleetStats } from '../types/dashboard.types';

export interface AdminFleetOverviewProps {
  fleetStats: AdminDashboardFleetStats;
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering physical fleet hardware health and status distribution.
 */
export function AdminFleetOverview({
  fleetStats,
  isLoading = false,
}: AdminFleetOverviewProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card p-5 space-y-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  const {
    totalDevices,
    availableDevices,
    rentedDevices,
    bookedDevices,
    maintenanceDevices,
    lostDevices,
    avgBatteryHealth,
  } = fleetStats;

  const inUseCount = rentedDevices + bookedDevices;
  const issueCount = maintenanceDevices + lostDevices;

  // Calculate percentage segments for the distribution bar
  const availPct = totalDevices > 0 ? (availableDevices / totalDevices) * 100 : 0;
  const inUsePct = totalDevices > 0 ? (inUseCount / totalDevices) * 100 : 0;
  const issuePct = totalDevices > 0 ? (issueCount / totalDevices) * 100 : 0;

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-semibold text-foreground font-heading">
              Fleet Inventory & Hardware Status
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time allocation across {totalDevices} registered portable hardware devices.
            </p>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
            <span>Avg Battery Health:</span>
            <span className="font-semibold text-foreground">{avgBatteryHealth}%</span>
          </div>
        </div>

        {/* Proportional Status Segment Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
          {availPct > 0 && (
            <div
              style={{ width: `${availPct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Available: ${availableDevices} devices (${Math.round(availPct)}%)`}
            />
          )}
          {inUsePct > 0 && (
            <div
              style={{ width: `${inUsePct}%` }}
              className="bg-purple-500 h-full transition-all"
              title={`In Use: ${inUseCount} devices (${Math.round(inUsePct)}%)`}
            />
          )}
          {issuePct > 0 && (
            <div
              style={{ width: `${issuePct}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Maintenance / Issues: ${issueCount} devices (${Math.round(issuePct)}%)`}
            />
          )}
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Available */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {availableDevices}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Ready for rental
            </div>
          </div>

          {/* In Use / Active */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-purple-500" />
              <span>In Use</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {inUseCount}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {rentedDevices} rented, {bookedDevices} booked
            </div>
          </div>

          {/* Maintenance */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>Maintenance</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {maintenanceDevices}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Inspection / Service
            </div>
          </div>

          {/* Total Fleet */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-foreground/40" />
              <span>Total Units</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {totalDevices}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Complete fleet size
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
