import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, RotateCcw, AlertCircle } from 'lucide-react';

export default function AdminResetCard() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const CONFIRM_TEXT = 'RESET ADMIN';

  const handleResetClick = () => {
    setShowConfirmDialog(true);
    setConfirmText('');
    setConfirmError('');
  };

  const handleConfirmReset = () => {
    if (confirmText !== CONFIRM_TEXT) {
      setConfirmError(`Please type "${CONFIRM_TEXT}" to confirm`);
      return;
    }

    // Show instructions for manual reset
    setShowConfirmDialog(false);
    alert(
      'To reset admin configuration:\n\n' +
      '1. The backend migration has been configured to reset admin credentials\n' +
      '2. Redeploy your canister using: dfx deploy backend\n' +
      '3. After redeployment, admin credentials will be cleared\n' +
      '4. You can then set up new admin credentials\n\n' +
      'Note: This requires access to the dfx command line tools.'
    );
  };

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Reset Admin Configuration</CardTitle>
          </div>
          <CardDescription>
            Clear all admin credentials and start fresh. This action requires a canister redeployment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning: Destructive Action</AlertTitle>
            <AlertDescription>
              Resetting admin configuration will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clear all stored admin credentials</li>
                <li>Remove admin privileges from all principals</li>
                <li>Require you to set up admin credentials again</li>
                <li>Require a canister redeployment to take effect</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">How to reset:</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Click the "Reset Admin Configuration" button below</li>
              <li>Confirm the reset action</li>
              <li>Redeploy the backend canister using: <code className="bg-background px-1 py-0.5 rounded">dfx deploy backend</code></li>
              <li>After redeployment, set up new admin credentials</li>
            </ol>
          </div>

          <Button
            variant="destructive"
            onClick={handleResetClick}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Admin Configuration
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Admin Reset
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This will prepare the backend to reset all admin configuration on the next deployment.
                You will need to redeploy the canister for changes to take effect.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="confirmText">
                  Type <span className="font-mono font-bold">{CONFIRM_TEXT}</span> to confirm:
                </Label>
                <Input
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setConfirmError('');
                  }}
                  placeholder={CONFIRM_TEXT}
                  className="font-mono"
                />
                {confirmError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {confirmError}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
