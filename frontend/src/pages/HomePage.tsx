import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { CustomerDashboardPage } from '@/features/dashboard/pages/customer-dashboard-page';
import { ShieldCheck, HardDrive, BookOpen } from 'lucide-react';

/**
 * Route coordinator for the home path (`/`).
 * Selects between Customer Dashboard and Admin Operational Hub based on user role.
 */
export function HomePage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  // If logged-in user is an Administrator, display dedicated Admin Operational Portal
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Admin Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fleet inventory management, customer rental orders, dispatch inspection, and returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <HardDrive className="size-4" />
              </div>
              <h3 className="font-semibold text-base text-foreground">
                Device Fleet Management
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add new hardware units, edit device IMEI/serials, adjust daily rates, and manage operational statuses.
              </p>
              <div className="pt-1">
                <Button asChild size="sm" className="h-8 text-xs font-medium">
                  <Link to="/device">Manage Device Fleet</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="size-4" />
              </div>
              <h3 className="font-semibold text-base text-foreground">
                Rental Order Operations
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review all customer bookings, process device dispatches, update return inspections, and monitor payments.
              </p>
              <div className="pt-1">
                <Button asChild size="sm" className="h-8 text-xs font-medium">
                  <Link to="/rental">Manage Rental Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-muted/20">
          <CardContent className="p-4 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>
              You are logged in with administrative privileges. Dedicated admin telemetry and fleet utilization analytics are isolated from customer views.
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular Customer or Guest View: Customer Dashboard
  return <CustomerDashboardPage />;
}

export default HomePage;
