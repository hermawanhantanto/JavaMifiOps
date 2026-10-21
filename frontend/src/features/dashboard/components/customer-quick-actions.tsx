import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, BookOpen, Globe2, ArrowRight } from 'lucide-react';

/**
 * Single-purpose component rendering primary action navigation cards.
 */
export function CustomerQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* Action 1: Rent WiFi */}
      <Link to="/device" className="group block focus:outline-none">
        <Card className="h-full border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-1.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Wifi className="size-4" />
              </div>
              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                Rent Pocket WiFi
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browse our fleet of 4G and 5G portable devices ready for immediate departure.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-primary pt-1">
              <span>View Available Devices</span>
              <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Action 2: Manage Bookings */}
      <Link to="/rental" className="group block focus:outline-none">
        <Card className="h-full border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-1.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <BookOpen className="size-4" />
              </div>
              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                My Bookings & Rentals
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review active contracts, view payment receipts, and track upcoming reservations.
              </p>
            </div>
            <div className="flex items-center text-xs font-medium text-primary pt-1">
              <span>Go to Rentals</span>
              <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Action 3: Global Coverage & Service */}
      <div className="group block">
        <Card className="h-full border-border bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="space-y-1.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Globe2 className="size-4" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                Worldwide Coverage
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Over 160 countries supported with seamless multi-carrier failover and zero roaming fees.
              </p>
            </div>
            <div className="text-[11px] text-muted-foreground/80 pt-1">
              24/7 dedicated customer support
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
