import { Button } from '@/components/ui/button';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">JavaMifi Ops</h1>
        <p className="text-sm text-muted-foreground">
          Operational Dashboard &amp; Customer Portal
        </p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>TanStack Query: Initialized</li>
          <li>Axios: Initialized with interceptors</li>
          <li>React Router: Initialized with Data Router</li>
          <li>Zod: Schema validation ready</li>
          <li>Shadcn UI: Initialized with Tailwind CSS v4</li>
        </ul>
        <div className="pt-2 flex gap-2">
          <Button variant="default">Primary Action</Button>
          <Button variant="outline">Secondary</Button>
        </div>
      </div>
    </div>
  );
}
