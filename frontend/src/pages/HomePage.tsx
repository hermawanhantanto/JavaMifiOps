import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { CustomerDashboardPage } from '@/features/dashboard/pages/customer-dashboard-page';
import { AdminDashboardPage } from '@/features/dashboard/pages/admin-dashboard-page';

/**
 * Route coordinator for the home path (`/`).
 * Selects between Customer Dashboard and Admin Operational Hub based on user role.
 */
export function HomePage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  // If logged-in user is an Administrator, display dedicated Admin Operations Center
  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  // Regular Customer or Guest View: Customer Dashboard
  return <CustomerDashboardPage />;
}

export default HomePage;
