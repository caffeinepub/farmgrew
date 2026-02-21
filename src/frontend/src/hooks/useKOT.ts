import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order, Customer, Product } from '../backend';

export interface EnrichedOrderData {
  order: Order;
  customer: Customer | null;
  items: Array<{
    productId: bigint;
    quantity: bigint;
    product: Product | null;
  }>;
}

export function useKOT(orderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EnrichedOrderData | null>({
    queryKey: ['kot', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;

      try {
        // Fetch the order
        const order = await actor.getOrderById(orderId);

        // Fetch customer details
        let customer: Customer | null = null;
        try {
          customer = await actor.getCustomerByPrincipal(order.customer);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }

        // Fetch product details for each item
        const itemsWithProducts = await Promise.all(
          order.items.map(async ([productId, quantity]) => {
            let product: Product | null = null;
            try {
              product = await actor.getProductById(productId);
            } catch (error) {
              console.error(`Error fetching product ${productId}:`, error);
            }
            return {
              productId,
              quantity,
              product,
            };
          })
        );

        return {
          order,
          customer,
          items: itemsWithProducts,
        };
      } catch (error) {
        console.error('Error fetching KOT data:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!orderId,
    retry: false,
  });
}
