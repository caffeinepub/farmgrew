import { useEffect, useState } from 'react';
import { useGetStripeSessionStatus } from '../hooks/useStripe';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentFailurePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: sessionStatus } = useGetStripeSessionStatus(sessionId);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const sessionIdParam = params.get('session_id');
    const orderIdParam = params.get('orderId');

    if (sessionIdParam) setSessionId(sessionIdParam);
    if (orderIdParam) setOrderId(orderIdParam);
  }, []);

  const getFailureReason = (): string => {
    if (sessionStatus?.__kind__ === 'failed') {
      return sessionStatus.failed.error;
    }
    return 'Payment was canceled or could not be completed.';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl">Payment Not Completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>{getFailureReason()}</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Your order has been created but payment was not completed. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                  <li>Return to your cart and try again</li>
                  <li>View your orders to see the pending order</li>
                  <li>Continue shopping and checkout later</li>
                </ul>
              </div>

              {orderId && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-semibold">#{orderId}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: Payment Pending
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/cart')} className="w-full">
                  Return to Cart
                </Button>
                <Button onClick={() => navigate('/orders')} variant="outline" className="w-full">
                  View My Orders
                </Button>
                <Button onClick={() => navigate('/shop')} variant="ghost" className="w-full">
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
