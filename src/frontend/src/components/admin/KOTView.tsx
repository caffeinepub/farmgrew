import { EnrichedOrderData } from '../../hooks/useKOT';
import { PaymentMethod } from '../../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Banknote, CreditCard, Clock, Calendar } from 'lucide-react';

interface KOTViewProps {
  data: EnrichedOrderData;
}

export default function KOTView({ data }: KOTViewProps) {
  const { order, customer, items } = data;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (priceCents: bigint): string => {
    return `₹${(Number(priceCents) / 100).toFixed(2)}`;
  };

  return (
    <div className="kot-container">
      {/* Print Button - Hidden during print */}
      <div className="no-print mb-6 flex justify-end">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print KOT
        </Button>
      </div>

      {/* KOT Content */}
      <Card className="kot-content">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-3xl font-bold">Kitchen Order Ticket</CardTitle>
          <div className="text-lg font-semibold text-muted-foreground mt-2">
            Order #{order.id.toString()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Order Metadata */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Order Date</div>
                <div className="font-semibold">{formatDate(order.timestamp)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Order Time</div>
                <div className="font-semibold">{formatTime(order.timestamp)}</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3 pb-4 border-b">
            <h3 className="text-lg font-semibold">Customer Details</h3>
            {customer ? (
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-semibold text-lg">{customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone Number</div>
                  <div className="font-semibold">{customer.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pickup Address</div>
                  <div className="font-medium">{customer.pickupAddress}</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Customer information not available</div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3 pb-4 border-b">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {item.product?.name || `Product #${item.productId.toString()}`}
                    </div>
                    {item.product?.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.product.description}
                      </div>
                    )}
                    {item.product?.category && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Category: {item.product.category}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">x{item.quantity.toString()}</div>
                    {item.product && (
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(item.product.priceCents)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3 pb-4 border-b">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {order.paymentMethod === PaymentMethod.cashOnDelivery ? (
                    <>
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Cash on Delivery</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Card Payment (Stripe)</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.paymentStatus.__kind__ === 'completed' ? 'Paid' : 'Pending'}
                </div>
              </div>
              <div className="flex items-center justify-between text-xl font-bold pt-2">
                <span>Total Amount</span>
                <span className="text-primary">{formatPrice(order.totalPriceCents)}</span>
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          {order.pickupTime && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Pickup Time</h3>
              <div className="font-medium">
                {formatDate(order.pickupTime)} at {formatTime(order.pickupTime)}
              </div>
            </div>
          )}

          {/* Order Status */}
          <div className="space-y-2 pt-4">
            <h3 className="text-lg font-semibold">Order Status</h3>
            <div className="font-medium capitalize">{order.status}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
