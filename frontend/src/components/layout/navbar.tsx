import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

/**
 * Top navigation bar component.
 * Features JavaMifiRent brand title, Home, Device, Rental nav links,
 * and user profile name with auth action on the right side.
 */
export function Navbar() {
  const { user, logout, isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

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

        {/* Right: Profile Name & Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs sm:text-sm text-foreground">
            <User className="size-3.5 sm:size-4 text-muted-foreground" />
            <span className="font-medium max-w-[140px] sm:max-w-[200px] truncate">
              {profileDisplayName}
            </span>
          </div>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="size-3.5 mr-1" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
