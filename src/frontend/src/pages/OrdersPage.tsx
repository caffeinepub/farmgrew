import { useOrders } from '../hooks/useOrders';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { OrderStatus, type Order } from '../backend';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  [OrderStatus.confirmed]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  [OrderStatus.completed]: 'bg-green-500/10 text-green-700 dark:text-green-400',
  [OrderStatus.expired]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [OrderStatus.canceled]: 'bg-red-500/10 text-red-700 dark:text-red-400',
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
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (order.paymentStatus.__kind__ === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getPaymentStatusText = (order: Order) => {
    if (order.paymentStatus.__kind__ === 'completed') {
      return 'Paid';
    }
    if (order.paymentStatus.__kind__ === 'failed') {
      return 'Payment Failed';
    }
    return 'Payment Pending';
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

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              View and track your order history
            </p>
          </div>

          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to place your first order
                </p>
                <Button onClick={() => navigate('/shop')}>Browse Products</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id.toString()}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Order #{order.id.toString()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {order.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          {getPaymentStatusIcon(order)}
                          <span className="text-muted-foreground">
                            {getPaymentStatusText(order)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-lg font-semibold mt-1">
                          ₹{(Number(order.totalPriceCents) / 100).toFixed(2)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
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
