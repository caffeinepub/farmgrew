import { useKOT } from '../hooks/useKOT';
import { usePathname } from '../router/usePathname';
import { navigate } from '../router/navigation';
import KOTView from '../components/admin/KOTView';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function KOTPage() {
  const pathname = usePathname();
  const orderIdMatch = pathname.match(/\/admin\/kot\/(\d+)/);
  const orderId = orderIdMatch ? BigInt(orderIdMatch[1]) : null;

  const { data, isLoading, error } = useKOT(orderId);

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />

      <main className="flex-1 py-12">
        <Container>
          {/* Back Button - Hidden during print */}
          <div className="no-print mb-6">
            <Button onClick={handleBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg text-muted-foreground">Loading KOT...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load Kitchen Order Ticket. Please try again.
              </AlertDescription>
            </Alert>
          ) : !data ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Order Not Found</AlertTitle>
              <AlertDescription>
                The requested order could not be found.
              </AlertDescription>
            </Alert>
          ) : (
            <KOTView data={data} />
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
