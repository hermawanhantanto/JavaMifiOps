import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface DeviceTableHeaderProps {
  isAdmin: boolean;
}

/**
 * Single-purpose table header component adapting columns according to user role.
 * Order: Model -> Speed -> Battery Health -> Daily Rate (plus hardware & actions for Admin).
 */
export function DeviceTableHeader({ isAdmin }: DeviceTableHeaderProps) {
  if (isAdmin) {
    return (
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[140px]">Serial Number</TableHead>
          <TableHead className="w-[160px]">IMEI</TableHead>
          <TableHead className="min-w-[130px]">Model</TableHead>
          <TableHead className="w-[140px]">Speed</TableHead>
          <TableHead className="w-[120px]">Battery Health</TableHead>
          <TableHead className="w-[130px]">Daily Rate</TableHead>
          <TableHead className="w-[110px]">Status</TableHead>
          <TableHead className="w-[140px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="min-w-[180px]">Model</TableHead>
        <TableHead className="w-[180px]">Speed</TableHead>
        <TableHead className="w-[150px]">Battery Health</TableHead>
        <TableHead className="w-[150px]">Daily Rate</TableHead>
        <TableHead className="w-[80px] text-right">Action</TableHead>
      </TableRow>
    </TableHeader>
  );
}
