import { type ReactNode } from 'react';
import { useCustomerProfile } from '../../hooks/useCustomer';
import { navigate } from '../../router/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';
import Container from '../layout/Container';
import TopNav from '../landing/TopNav';
import Footer from '../landing/Footer';

interface RequireRegistrationProps {
  children: ReactNode;
}

export default function RequireRegistration({ children }: RequireRegistrationProps) {
  const { data: profile, isLoading, isFetched } = useCustomerProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isFetched && !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <UserCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    Please complete your registration to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => navigate('/register')}
                    className="w-full"
                  >
                    Complete Registration
                  </Button>
                  <Button
                    onClick={() => navigate('/shop')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Shop
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
