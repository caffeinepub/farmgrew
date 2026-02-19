import { useState } from 'react';
import { useUpdateAdminCredentials } from '../../hooks/useAdminCredentials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCredentialsRotation() {
  const updateCredentials = useUpdateAdminCredentials();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string; confirmPassword?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);

    if (!validateForm()) return;

    try {
      await updateCredentials.mutateAsync({ username, password });
      toast.success('Admin credentials updated successfully');
      setShowSuccess(true);
      // Clear form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update credentials. Please try again.';
      toast.error(errorMessage);
    }
  };

  const isProcessing = updateCredentials.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle>Admin Credentials</CardTitle>
        </div>
        <CardDescription>
          Update the admin username and password for authorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showSuccess && (
            <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Credentials updated successfully. Old credentials will no longer work.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> After updating, the old credentials will no longer grant admin access.
              Make sure to save the new credentials securely.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="new-username">New Username</Label>
            <Input
              id="new-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: undefined });
                setShowSuccess(false);
              }}
              placeholder="Enter new username"
              disabled={isProcessing}
              autoComplete="off"
            />
            {errors.username && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
                setShowSuccess(false);
              }}
              placeholder="Enter new password"
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
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: undefined });
                setShowSuccess(false);
              }}
              placeholder="Confirm new password"
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
                Updating Credentials...
              </>
            ) : (
              'Update Credentials'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
