import { useAuth } from '@/hooks/useAuth';

export default function AccountMenu() {
  const { user, loading, signOutUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="account-menu">
        <span className="account-loading">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="account-menu">
      <span className="user-email">{user.displayName || user.email || 'User'}</span>
      <button onClick={handleSignOut} className="sign-out-button">
        Sign Out
      </button>
    </div>
  );
}
