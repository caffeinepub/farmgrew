import { type ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { navigate } from '../../router/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Container from '../layout/Container';
import TopNav from '../landing/TopNav';
import Footer from '../landing/Footer';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { identity, isInitializing, login, loginStatus } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>
                    Please log in to access this page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={login}
                    disabled={loginStatus === 'logging-in'}
                    className="w-full"
                  >
                    {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
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
