import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

export interface RentalTableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Single-purpose component rendering animated skeleton rows consistent with device table.
 */
export function RentalTableSkeleton({
  rows = 5,
  columns = 7,
}: RentalTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="py-3">
              <Skeleton className="h-4 w-full rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
