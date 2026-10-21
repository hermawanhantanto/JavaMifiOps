import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { SignUpPage } from '../features/auth/pages/signup-page';
import { SignInPage } from '../features/auth/pages/signin-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/signin',
    element: <SignInPage />,
  },
]);
