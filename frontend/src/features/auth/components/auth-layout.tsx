import * as React from 'react';
import { Outlet } from 'react-router-dom';

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

/**
 * Shared layout component for authentication domain views (Sign In & Sign Up).
 * Strictly responsible for centering the view and presenting the JavaMifiRent branding.
 * Wrapped in max-w-[1440px] mx-auto to maintain proper centering on wide screens.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen w-full max-w-[1440px] mx-auto flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* App Title Header */}
        <header className="flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            JavaMifiRent
          </h1>
        </header>

        {/* Content Card Container */}
        <section className="w-full" aria-label="Authentication container">
          {children ?? <Outlet />}
        </section>
      </div>
    </main>
  );
}
