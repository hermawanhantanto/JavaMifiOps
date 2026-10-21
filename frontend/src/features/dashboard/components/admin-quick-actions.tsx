import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { HardDrive, BookOpen, ArrowRight } from 'lucide-react';

/**
 * Single-purpose component rendering administrative management shortcut cards.
 */
export function AdminQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Action 1: Fleet Inventory Management */}
      <Link to="/device" className="group block focus:outline-none">
        <Card className="h-full border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-1.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <HardDrive className="size-4" />
              </div>
              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                Device Fleet Management
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add new hardware units, edit device IMEI and serial numbers, calibrate battery health, and adjust daily rates.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-primary pt-1">
              <span>Open Fleet Inventory</span>
              <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Action 2: Rental Orders & Logistics */}
      <Link to="/rental" className="group block focus:outline-none">
        <Card className="h-full border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-1.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <BookOpen className="size-4" />
              </div>
              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                Rental Order Operations
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review all customer bookings, dispatch devices with tracking waybills, conduct return inspections, and monitor payments.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-primary pt-1">
              <span>Open Rental Operations</span>
              <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
