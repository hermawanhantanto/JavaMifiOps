import { AuthLayout } from '../components/auth-layout';
import { SignUpCard } from '../components/signup-card';

/**
 * Route page for user registration (/signup).
 * Composes the shared AuthLayout with the SignUpCard.
 */
export function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpCard />
    </AuthLayout>
  );
}

export default SignUpPage;
