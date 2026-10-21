import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DevicePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-foreground">
      <Card className="max-w-md w-full shadow-sm border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Device Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Explore available JavaMifi portable WiFi devices and packages.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DevicePage;
