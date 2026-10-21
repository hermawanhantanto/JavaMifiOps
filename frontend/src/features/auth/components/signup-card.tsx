import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { SignUpForm } from './signup-form';

/**
 * Single-purpose SignUpCard component.
 * Houses the card frame, header typography, the SignUpForm, and the footer login navigation.
 */
export function SignUpCard() {
  return (
    <Card className="w-full shadow-sm border-border bg-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignUpForm />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 py-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Have an account?{' '}
          <Link
            to="/signin"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
