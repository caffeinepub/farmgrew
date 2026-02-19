import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, Package, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../../backend';

interface OrderTrackingTimelineProps {
  order: Order;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', label: 'Confirmed' },
  completed: { icon: Package, color: 'text-green-600', label: 'Completed' },
  expired: { icon: XCircle, color: 'text-gray-600', label: 'Expired' },
  canceled: { icon: XCircle, color: 'text-red-600', label: 'Canceled' },
};

export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Use tracking history if available, otherwise create minimal history
  const trackingEntries = order.tracking && order.tracking.length > 0
    ? order.tracking
    : [
        {
          status: order.status,
          timestamp: order.timestamp,
          note: 'Order created',
        },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trackingEntries.map((entry, index) => {
            const config = STATUS_CONFIG[entry.status];
            const Icon = config.icon;
            const isLast = index === trackingEntries.length - 1;

            return (
              <div key={index} className="relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 bg-background border-2 ${
                        index === 0 ? 'border-primary' : 'border-muted'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${index === 0 ? config.color : 'text-muted-foreground'}`} />
                    </div>
                    {!isLast && (
                      <Separator orientation="vertical" className="h-12 w-0.5 my-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge
                          variant="outline"
                          className={index === 0 ? 'font-semibold' : ''}
                        >
                          {config.label}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {entry.note}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
