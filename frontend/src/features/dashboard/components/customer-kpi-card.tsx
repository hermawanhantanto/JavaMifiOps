import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface CustomerKpiCardProps {
  label: string;
  value: string | number;
  description: string;
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering an individual customer metric card.
 * Modern, clean, and minimalist with pure typography.
 */
export function CustomerKpiCard({
  label,
  value,
  description,
  isLoading = false,
}: CustomerKpiCardProps) {
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
    <Card className="border-border bg-card shadow-none hover:border-border/80 transition-colors">
      <CardContent className="p-4 sm:p-5 space-y-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
          {label}
        </span>

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
