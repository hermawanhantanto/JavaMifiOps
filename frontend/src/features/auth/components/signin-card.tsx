import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { SignInForm } from './signin-form';

/**
 * Single-purpose SignInCard component.
 * Houses the card frame, optional registration success notification,
 * the SignInForm, and the footer signup navigation.
 */
export function SignInCard() {
  const location = useLocation();
  const signupSuccessMessage =
    (location.state as { signupSuccess?: boolean; message?: string } | null)?.message;

  return (
    <Card className="w-full shadow-sm border-border bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Sign In
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {signupSuccessMessage && (
          <div
            role="status"
            className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground font-medium"
          >
            {signupSuccessMessage}
          </div>
        )}

        <SignInForm />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 py-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
