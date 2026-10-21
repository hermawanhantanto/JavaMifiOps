import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface RentalTableHeaderProps {
  isAdmin: boolean;
}

/**
 * Single-purpose table header component projecting columns based on user role.
 * Customer: 7 columns (Rental Code -> Device Model -> Destination -> Dates -> Total Amount -> Status -> Action)
 * Admin: 8 columns (Rental Code -> User Name -> Device Model -> Destination -> Dates -> Total Amount -> Status -> Action)
 */
export function RentalTableHeader({ isAdmin }: RentalTableHeaderProps) {
  if (isAdmin) {
    return (
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[180px]">Rental Code</TableHead>
          <TableHead className="min-w-[150px]">User Name</TableHead>
          <TableHead className="min-w-[140px]">Device Model</TableHead>
          <TableHead className="min-w-[140px]">Destination</TableHead>
          <TableHead className="w-[200px]">Dates</TableHead>
          <TableHead className="w-[130px]">Total Amount</TableHead>
          <TableHead className="w-[130px]">Status</TableHead>
          <TableHead className="w-[160px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-[180px]">Rental Code</TableHead>
        <TableHead className="min-w-[150px]">Device Model</TableHead>
        <TableHead className="min-w-[150px]">Destination</TableHead>
        <TableHead className="w-[220px]">Dates</TableHead>
        <TableHead className="w-[140px]">Total Amount</TableHead>
        <TableHead className="w-[130px]">Status</TableHead>
        <TableHead className="w-[180px] text-right">Action</TableHead>
      </TableRow>
    </TableHeader>
  );
}
