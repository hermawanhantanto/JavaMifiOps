import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/app-layout';
import { HomePage } from '../pages/HomePage';
import { DevicePage } from '../pages/DevicePage';
import { RentalPage } from '../pages/RentalPage';
import { SignUpPage } from '../features/auth/pages/signup-page';
import { SignInPage } from '../features/auth/pages/signin-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'device',
        element: <DevicePage />,
      },
      {
        path: 'rental',
        element: <RentalPage />,
      },
    ],
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
