import { useState } from 'react';
import { useAuthenticateAdmin } from '../../hooks/useAdminAuthorization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginForm() {
  const authenticateAdmin = useAuthenticateAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!validateForm()) return;

    try {
      await authenticateAdmin.mutateAsync({ username, password });
      toast.success('Admin access granted successfully');
      // Clear form
      setUsername('');
      setPassword('');
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isProcessing = authenticateAdmin.isPending;

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Admin Authorization</CardTitle>
        <CardDescription>
          Enter your admin credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
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
                setAuthError('');
              }}
              placeholder="Enter your username"
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
                setAuthError('');
              }}
              placeholder="Enter your password"
              disabled={isProcessing}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
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
                Authenticating...
              </>
            ) : (
              'Login as Admin'
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
