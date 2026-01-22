/**
 * useAuth hook
 * Custom hook for consuming authentication context
 */

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook to access authentication state and methods
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login('email', 'pass')}>Login</button>;
 *   }
 *   
 *   return <div>Welcome, {user.displayName}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider>.'
    );
  }
  
  return context;
}
