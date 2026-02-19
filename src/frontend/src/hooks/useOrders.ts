import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Order, Time } from '../backend';

export function useOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      const orders = await actor.getOrders();
      // Sort by timestamp, newest first
      return orders.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useOrderById(orderId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getOrderById(BigInt(orderId));
      } catch (error) {
        console.error('Error fetching order:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !!orderId,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pickupTime: Time | null) => {
      if (!actor) throw new Error('Actor not available');
      const orderId = await actor.placeOrder(pickupTime);
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useSetOrderPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: bigint; sessionId: string; amountCents: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOrderPaid(params.orderId, params.sessionId, params.amountCents);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
