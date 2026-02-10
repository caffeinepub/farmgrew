import { useOrders } from '../hooks/useOrders';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ChevronRight } from 'lucide-react';
import { OrderStatus } from '../backend';

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
          <h1 className="text-4xl font-bold mb-8">My Orders</h1>

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
                        <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[order.status]}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold text-lg mt-1">
                          ₹{(Number(order.totalPriceCents) / 100).toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
