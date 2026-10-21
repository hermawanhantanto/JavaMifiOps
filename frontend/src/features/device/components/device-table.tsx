import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DeviceItem, PaginationMeta } from '../types/device.types';
import { DeviceTableHeader } from './device-table-header';
import { DeviceTableRow } from './device-table-row';
import { DeviceTableSkeleton } from './device-table-skeleton';

export interface DeviceTableProps {
  devices: DeviceItem[];
  pagination?: PaginationMeta;
  isLoading: boolean;
  isAdmin: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Main device table component.
 * Encapsulates table markup, role-scoped row rendering, skeleton loading, and pagination bar.
 */
export function DeviceTable({
  devices,
  pagination,
  isLoading,
  isAdmin,
  onPageChange,
}: DeviceTableProps) {
  const columnCount = isAdmin ? 7 : 4;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? 0;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <DeviceTableHeader isAdmin={isAdmin} />

          <TableBody>
            {isLoading ? (
              <DeviceTableSkeleton rows={5} columns={columnCount} />
            ) : devices.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No devices found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <DeviceTableRow
                  key={device.id}
                  device={device}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1">
          <div>
            Showing <span className="font-medium text-foreground">{devices.length}</span> of{' '}
            <span className="font-medium text-foreground">{totalItems}</span> devices
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="text-xs font-medium px-1">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 px-2 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
