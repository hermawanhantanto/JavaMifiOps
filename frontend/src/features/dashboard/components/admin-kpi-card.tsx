import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface AdminKpiCardProps {
  label: string;
  value: string | number;
  description: string;
  isLoading?: boolean;
  alert?: boolean;
}

/**
 * Single-purpose component rendering an administrative metric card.
 * Modern, clean, and minimalist with pure typography (no icon decoration).
 */
export function AdminKpiCard({
  label,
  value,
  description,
  isLoading = false,
  alert = false,
}: AdminKpiCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card p-4 sm:p-5 space-y-2 shadow-none">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-28" />
      </Card>
    );
  }

  return (
    <Card
      className={`border-border bg-card shadow-none transition-colors ${
        alert ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'hover:border-border/80'
      }`}
    >
      <CardContent className="p-4 sm:p-5 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
            {label}
          </span>
          {alert && (
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          {value}
        </div>

        <p className="text-xs text-muted-foreground leading-normal">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
