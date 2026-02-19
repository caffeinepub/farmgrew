import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGrantAdmin, useCheckUserRole } from '../../hooks/useAdminManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Shield, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../../backend';

export default function AdminManagement() {
  const { identity } = useInternetIdentity();
  const grantAdmin = useGrantAdmin();
  const checkUserRole = useCheckUserRole();

  const [principalInput, setPrincipalInput] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkedRole, setCheckedRole] = useState<UserRole | null>(null);

  const currentPrincipal = identity?.getPrincipal().toString() || '';

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(currentPrincipal);
      setCopied(true);
      toast.success('Principal copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError('Principal is required');
      return false;
    }

    try {
      // This will throw if the principal is invalid
      const principal = value.trim();
      // Basic validation - principals are base32 encoded
      if (!/^[a-z0-9-]+$/.test(principal)) {
        setPrincipalError('Invalid principal format');
        return false;
      }
      setPrincipalError('');
      return true;
    } catch (error) {
      setPrincipalError('Invalid principal format');
      return false;
    }
  };

  const handleCheckRole = async () => {
    if (!validatePrincipal(principalInput)) return;

    try {
      const role = await checkUserRole.mutateAsync(principalInput.trim());
      setCheckedRole(role);
      toast.success(`User role: ${role}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to check user role');
      setCheckedRole(null);
    }
  };

  const handleGrantAdmin = async () => {
    if (!validatePrincipal(principalInput)) return;

    try {
      await grantAdmin.mutateAsync(principalInput.trim());
      toast.success('Admin privileges granted successfully');
      setPrincipalInput('');
      setCheckedRole(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant admin privileges');
    }
  };

  const isProcessing = grantAdmin.isPending || checkUserRole.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Admin Management</CardTitle>
        </div>
        <CardDescription>
          Manage administrator access using Internet Identity Principals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current User Principal */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Your Principal ID</Label>
          <div className="flex gap-2">
            <Input
              value={currentPrincipal}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPrincipal}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this Principal ID with an existing admin to request access
          </p>
        </div>

        {/* Grant Admin Section */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h3 className="text-sm font-semibold mb-1">Grant Admin Privileges</h3>
            <p className="text-xs text-muted-foreground">
              Enter a user's Internet Identity Principal to grant them admin access
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="principal-input">Principal ID</Label>
            <Input
              id="principal-input"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                setPrincipalError('');
                setCheckedRole(null);
              }}
              placeholder="e.g., 2vxsx-fae..."
              className="font-mono text-sm"
              disabled={isProcessing}
            />
            {principalError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {principalError}
              </p>
            )}
            {checkedRole && (
              <Alert>
                <AlertDescription className="text-sm">
                  Current role: <span className="font-semibold">{checkedRole}</span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCheckRole}
              disabled={isProcessing || !principalInput.trim()}
              className="flex-1"
            >
              {checkUserRole.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Role'
              )}
            </Button>
            <Button
              onClick={handleGrantAdmin}
              disabled={isProcessing || !principalInput.trim()}
              className="flex-1 gap-2"
            >
              {grantAdmin.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Grant Admin
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Information Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> Admin access is granted to Internet Identity Principals, not email addresses.
            Users must sign in with Internet Identity to receive admin privileges.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
