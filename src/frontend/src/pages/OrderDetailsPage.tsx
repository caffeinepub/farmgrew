import { useOrderById } from '../hooks/useOrders';
import { useProducts } from '../hooks/useProducts';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import OrderTrackingTimeline from '../components/orders/OrderTrackingTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, Clock, CreditCard, Banknote } from 'lucide-react';
import { OrderStatus, PaymentMethod } from '../backend';
import { getProductImageUrl, getProductImageFallback } from '../lib/productImage';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  [OrderStatus.confirmed]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  [OrderStatus.completed]: 'bg-green-500/10 text-green-700 dark:text-green-400',
  [OrderStatus.expired]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [OrderStatus.canceled]: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

interface OrderDetailsPageProps {
  orderId: string;
}

export default function OrderDetailsPage({ orderId }: OrderDetailsPageProps) {
  const { data: order, isLoading } = useOrderById(orderId);
  const { data: allProducts } = useProducts();

  const getProductDetails = (productId: bigint) => {
    return allProducts?.find((p) => p.id === productId);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodDisplay = () => {
    if (!order) return null;

    const isCOD = order.paymentMethod === PaymentMethod.cashOnDelivery;
    
    return (
      <div className="flex items-center gap-2">
        {isCOD ? (
          <>
            <Banknote className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
            </div>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Credit/Debit Card</div>
              <div className="text-sm text-muted-foreground">Paid via Stripe</div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getPaymentStatusDisplay = () => {
    if (!order) return null;

    const isCOD = order.paymentMethod === PaymentMethod.cashOnDelivery;

    if (order.paymentStatus.__kind__ === 'completed') {
      return (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Payment Completed</AlertTitle>
          <AlertDescription>
            {isCOD ? (
              <>Payment of ₹{(Number(order.paymentStatus.completed.amountCents) / 100).toFixed(2)} received on{' '}
              {formatDate(order.paymentStatus.completed.timestamp)}</>
            ) : (
              <>Payment of ₹{(Number(order.paymentStatus.completed.amountCents) / 100).toFixed(2)} received on{' '}
              {formatDate(order.paymentStatus.completed.timestamp)}</>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (order.paymentStatus.__kind__ === 'failed') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription>
            {order.paymentStatus.failed.reason}
          </AlertDescription>
        </Alert>
      );
    }

    // Pending payment
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>{isCOD ? 'Payment on Delivery' : 'Payment Pending'}</AlertTitle>
        <AlertDescription>
          {isCOD 
            ? 'Please pay the order amount when you receive your order.'
            : 'This order is awaiting payment. Please complete the payment to confirm your order.'}
        </AlertDescription>
      </Alert>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 section-spacing-sm">
          <Container>
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The order you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => navigate('/orders')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
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
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        Order #{order.id.toString()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {getPaymentMethodDisplay()}
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {getPaymentStatusDisplay()}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map(([productId, quantity]) => {
                      const product = getProductDetails(productId);
                      if (!product) return null;

                      return (
                        <div key={productId.toString()}>
                          <div className="flex gap-4">
                            <img
                              src={getProductImageUrl(product.name)}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = getProductImageFallback();
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.category}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Quantity: {Number(quantity)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                ₹{((Number(product.priceCents) * Number(quantity)) / 100).toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ₹{(Number(product.priceCents) / 100).toFixed(2)} each
                              </p>
                            </div>
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(Number(order.totalPriceCents) / 100).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(Number(order.totalPriceCents) / 100).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTrackingTimeline order={order} />
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
