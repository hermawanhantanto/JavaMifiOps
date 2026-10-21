import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface DeviceTableHeaderProps {
  isAdmin: boolean;
}

/**
 * Single-purpose table header component adapting columns according to user role.
 */
export function DeviceTableHeader({ isAdmin }: DeviceTableHeaderProps) {
  if (isAdmin) {
    return (
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[140px]">Serial Number</TableHead>
          <TableHead className="w-[160px]">IMEI</TableHead>
          <TableHead className="min-w-[140px]">Model</TableHead>
          <TableHead className="w-[120px]">Battery</TableHead>
          <TableHead className="w-[150px]">Speed</TableHead>
          <TableHead className="w-[140px]">Daily Rate</TableHead>
          <TableHead className="w-[120px] text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="min-w-[180px]">Model</TableHead>
        <TableHead className="w-[180px]">Speed</TableHead>
        <TableHead className="w-[160px]">Daily Rate</TableHead>
        <TableHead className="w-[140px] text-right">Battery Health</TableHead>
      </TableRow>
    </TableHeader>
  );
}
