import { useState } from 'react';
import { useSetInitialAdminCredentials, useIsAdminConfigured } from '../../hooks/useInitialAdminSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function InitialAdminSetupForm() {
  const setInitialCredentials = useSetInitialAdminCredentials();
  const { data: isConfigured, isLoading: checkingConfig } = useIsAdminConfigured();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});
  const [setupError, setSetupError] = useState<string>('');
  const [setupSuccess, setSetupSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string; confirmPassword?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSetupSuccess(false);

    if (!validateForm()) return;

    try {
      await setInitialCredentials.mutateAsync({ username, password });
      setSetupSuccess(true);
      toast.success('Admin credentials configured successfully! You can now access the admin dashboard.');
      
      // Clear form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // Reload page after a short delay to refresh admin status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to configure admin credentials. Please try again.';
      setSetupError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isProcessing = setInitialCredentials.isPending;

  // Show loading state while checking configuration
  if (checkingConfig) {
    return (
      <Card className="max-w-md w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // If already configured, show message to use login form
  if (isConfigured) {
    return (
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Info className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Admin Already Configured</CardTitle>
          <CardDescription>
            Admin credentials have already been set up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Use Admin Login</AlertTitle>
            <AlertDescription>
              Admin credentials are already configured. Please use the admin login form to authenticate.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (setupSuccess) {
    return (
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Setup Complete!</CardTitle>
          <CardDescription>
            Your admin credentials have been configured successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Redirecting to admin dashboard...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Initial Admin Setup</CardTitle>
        <CardDescription>
          Configure your admin credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>First-time Setup</AlertTitle>
          <AlertDescription>
            Admin credentials have not been configured yet. Set up your username and password to gain admin access.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {setupError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{setupError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: undefined });
                setSetupError('');
              }}
              placeholder="Choose a username"
              disabled={isProcessing}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
                setSetupError('');
              }}
              placeholder="Choose a strong password"
              disabled={isProcessing}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: undefined });
                setSetupError('');
              }}
              placeholder="Confirm your password"
              disabled={isProcessing}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Configure Admin Credentials'
            )}
          </Button>

          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
              disabled={isProcessing}
            >
              Return to Home
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
