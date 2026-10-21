import { Link, NavLink } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

/**
 * Top navigation bar component.
 * Features JavaMifiRent brand title, Home, Device, Rental nav links,
 * and user display name on the right side.
 */
export function Navbar() {
  const { user, isAuthenticated } = useCurrentUser();

  const profileDisplayName = user?.name || user?.email || 'Guest User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Title & Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            to="/"
            className="font-heading font-bold text-lg sm:text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            JavaMifiRent
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-foreground underline underline-offset-4 decoration-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/device"
              className={({ isActive }) =>
                isActive
                  ? 'text-foreground underline underline-offset-4 decoration-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              Device
            </NavLink>
            <NavLink
              to="/rental"
              className={({ isActive }) =>
                isActive
                  ? 'text-foreground underline underline-offset-4 decoration-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              Rental
            </NavLink>
          </nav>
        </div>

        {/* Right: Clean Display Name */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <span className="text-sm font-medium text-foreground">
              {profileDisplayName}
            </span>
          ) : (
            <Link
              to="/signin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
