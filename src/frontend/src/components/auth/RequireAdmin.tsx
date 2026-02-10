import { type ReactNode } from 'react';
import { useIsAdmin } from '../../hooks/useAdminProducts';
import { navigate } from '../../router/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Container from '../layout/Container';
import TopNav from '../landing/TopNav';
import Footer from '../landing/Footer';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    Admin access is restricted to the Internet Identity linked to the Google account <strong>grandzbee@gmail.com</strong>. Please sign in with the authorized Internet Identity to access this page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => navigate('/')}
                    variant="default"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                  <Button
                    onClick={() => navigate('/shop')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Shop
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
