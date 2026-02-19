import { type ReactNode } from 'react';
import { useIsAdmin } from '../../hooks/useAdminProducts';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsAdminConfigured } from '../../hooks/useInitialAdminSetup';
import AdminLoginForm from './AdminLoginForm';
import InitialAdminSetupForm from '../admin/InitialAdminSetupForm';
import { Loader2 } from 'lucide-react';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsAdmin();
  const { data: isConfigured, isLoading: configLoading, isFetched: configFetched } = useIsAdminConfigured();

  const isAuthenticated = !!identity;
  const isLoading = adminLoading || configLoading || !adminFetched || !configFetched;

  // Show loading state while checking admin status and configuration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show initial setup form if authenticated but admin credentials are not configured
  if (isAuthenticated && isConfigured === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <InitialAdminSetupForm />
      </div>
    );
  }

  // Show admin login form for authenticated non-admin users when credentials are configured
  if (isAuthenticated && !isAdmin && isConfigured === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AdminLoginForm />
      </div>
    );
  }

  // Render children only for admin users
  if (isAdmin) {
    return <>{children}</>;
  }

  // Fallback for unexpected states
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
