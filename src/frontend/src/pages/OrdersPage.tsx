import { useOrders } from '../hooks/useOrders';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ChevronRight, AlertCircle, CheckCircle2, Clock, CreditCard, Banknote } from 'lucide-react';
import { OrderStatus, PaymentMethod, type Order } from '../backend';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'bg-warning/10 text-warning border-warning/20',
  [OrderStatus.confirmed]: 'bg-primary/10 text-primary border-primary/20',
  [OrderStatus.completed]: 'bg-success/10 text-success border-success/20',
  [OrderStatus.expired]: 'bg-muted text-muted-foreground border-border',
  [OrderStatus.canceled]: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusIcon = (order: Order) => {
    if (order.paymentStatus.__kind__ === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    if (order.paymentStatus.__kind__ === 'failed') {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    return <Clock className="h-5 w-5 text-warning" />;
  };

  const getPaymentStatusText = (order: Order) => {
    if (order.paymentStatus.__kind__ === 'completed') {
      return 'Paid';
    }
    if (order.paymentStatus.__kind__ === 'failed') {
      return 'Payment Failed';
    }
    return order.paymentMethod === PaymentMethod.cashOnDelivery ? 'Payment on Delivery' : 'Payment Pending';
  };

  const getPaymentMethodBadge = (order: Order) => {
    const isCOD = order.paymentMethod === PaymentMethod.cashOnDelivery;
    return (
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
        {isCOD ? (
          <>
            <Banknote className="h-4 w-4" />
            <span>COD</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>Card</span>
          </>
        )}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <div className="mb-8 space-y-3">
            <h1>My Orders</h1>
            <p className="text-lg text-muted-foreground">
              View and track your order history
            </p>
          </div>

          {!orders || orders.length === 0 ? (
            <Card className="rounded-lg shadow-soft">
              <CardContent className="py-16 text-center space-y-6">
                <Package className="h-20 w-20 text-muted-foreground mx-auto" />
                <h2>No orders yet</h2>
                <p className="text-muted-foreground text-lg">
                  Start shopping to place your first order
                </p>
                <Button onClick={() => navigate('/shop')} size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id.toString()}
                  className="hover:shadow-soft-lg transition-all duration-200 cursor-pointer rounded-lg"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl">
                          Order #{order.id.toString()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {order.status}
                        </Badge>
                        {getPaymentMethodBadge(order)}
                        <div className="flex items-center gap-2 text-sm">
                          {getPaymentStatusIcon(order)}
                          <span className="text-muted-foreground font-medium">
                            {getPaymentStatusText(order)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{(Number(order.totalPriceCents) / 100).toFixed(2)}
                        </p>
                      </div>
                      <Button variant="ghost" size="lg" className="gap-2">
                        View Details
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
