import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface RentalTableHeaderProps {
  isAdmin: boolean;
}

/**
 * Single-purpose table header component consistent with device table styling.
 */
export function RentalTableHeader({ isAdmin }: RentalTableHeaderProps) {
  if (isAdmin) {
    return (
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[140px]">Rental Code</TableHead>
          <TableHead className="min-w-[130px]">User Name</TableHead>
          <TableHead className="min-w-[120px]">Device Model</TableHead>
          <TableHead className="min-w-[110px]">Destination</TableHead>
          <TableHead className="w-[150px]">Dates</TableHead>
          <TableHead className="w-[110px]">Fulfillment</TableHead>
          <TableHead className="w-[110px]">Total Amount</TableHead>
          <TableHead className="w-[110px]">Status</TableHead>
          <TableHead className="w-[110px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-[150px]">Rental Code</TableHead>
        <TableHead className="min-w-[140px]">Device Model</TableHead>
        <TableHead className="min-w-[120px]">Destination</TableHead>
        <TableHead className="w-[160px]">Dates</TableHead>
        <TableHead className="w-[120px]">Fulfillment</TableHead>
        <TableHead className="w-[120px]">Total Amount</TableHead>
        <TableHead className="w-[110px]">Status</TableHead>
        <TableHead className="w-[100px] text-right">Action</TableHead>
      </TableRow>
    </TableHeader>
  );
}
