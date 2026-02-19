import { useEffect, useState } from 'react';
import { useGetStripeSessionStatus } from '../hooks/useStripe';
import { useSetOrderPaid } from '../hooks/useOrders';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: sessionStatus, isLoading: statusLoading } = useGetStripeSessionStatus(sessionId);
  const setOrderPaid = useSetOrderPaid();

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const sessionIdParam = params.get('session_id');
    const orderIdParam = params.get('orderId');

    if (!sessionIdParam || !orderIdParam) {
      setError('Missing payment session information');
      return;
    }

    setSessionId(sessionIdParam);
    setOrderId(orderIdParam);
  }, []);

  useEffect(() => {
    if (!sessionStatus || !orderId || processingComplete) return;

    if (sessionStatus.__kind__ === 'completed') {
      // Extract amount from response
      let amountCents = 0;
      try {
        const response = JSON.parse(sessionStatus.completed.response);
        amountCents = response.amount_total || 0;
      } catch (e) {
        console.error('Failed to parse session response:', e);
      }

      // Mark order as paid
      setOrderPaid.mutate(
        {
          orderId: BigInt(orderId),
          sessionId: sessionId!,
          amountCents: BigInt(amountCents),
        },
        {
          onSuccess: () => {
            setProcessingComplete(true);
          },
          onError: (err: any) => {
            setError(err.message || 'Failed to finalize payment');
          },
        }
      );
    } else if (sessionStatus.__kind__ === 'failed') {
      setError(sessionStatus.failed.error || 'Payment verification failed');
    }
  }, [sessionStatus, orderId, sessionId, processingComplete, setOrderPaid]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 section-spacing-sm">
          <Container>
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <CardTitle className="text-2xl">Payment Processing Error</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex gap-3">
                  <Button onClick={() => navigate('/orders')} variant="outline">
                    View Orders
                  </Button>
                  <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (statusLoading || !processingComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 section-spacing-sm">
          <Container>
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Processing Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Order Confirmed</AlertTitle>
                <AlertDescription>
                  Your payment has been processed successfully and your order has been confirmed.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-semibold">#{orderId}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleViewOrder} className="flex-1">
                  View Order Details
                </Button>
                <Button onClick={() => navigate('/shop')} variant="outline" className="flex-1">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
