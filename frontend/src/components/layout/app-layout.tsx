import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar';

/**
 * Root Application Layout.
 * Contains top bar navigation and centers content with max-w-[1440px] container constraint.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
