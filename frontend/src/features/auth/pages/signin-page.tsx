import { AuthLayout } from '../components/auth-layout';
import { SignInCard } from '../components/signin-card';

/**
 * Route page for user authentication (/signin).
 * Composes the shared AuthLayout with the SignInCard.
 */
export function SignInPage() {
  return (
    <AuthLayout>
      <SignInCard />
    </AuthLayout>
  );
}

export default SignInPage;
