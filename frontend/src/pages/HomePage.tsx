import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-foreground">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">JavaMifiRent</h1>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>TanStack Query: Initialized</li>
          <li>Axios: Initialized with interceptors</li>
          <li>React Router: Initialized with Data Router</li>
          <li>Zod: Schema validation ready</li>
          <li>Shadcn UI: Initialized with Tailwind CSS v4</li>
        </ul>
        <div className="pt-2 flex gap-2">
          <Button asChild variant="default">
            <Link to="/signup">Go to Sign Up</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
