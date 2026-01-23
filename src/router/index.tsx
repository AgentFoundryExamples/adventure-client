import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AppPage from '@/pages/AppPage';
import GamePage from '@/pages/GamePage';
import NotFoundPage from '@/pages/NotFoundPage';
import DebugPage from '@/pages/DebugPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { config } from '@/config/env';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/app',
        element: (
          <ProtectedRoute>
            <AppPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/game/:characterId',
        element: (
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        ),
      },
      // Debug page - only available in development
      ...(config.isDevelopment
        ? [
            {
              path: '/debug',
              element: <DebugPage />,
            },
          ]
        : []),
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
