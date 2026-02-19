import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShoppingItem, StripeConfiguration, StripeSessionStatus } from '../backend';

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { items: ShoppingItem[]; orderId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success?orderId=${params.orderId}`;
      const cancelUrl = `${baseUrl}/payment-failure?orderId=${params.orderId}`;
      
      const result = await actor.createCheckoutSession(params.items, successUrl, cancelUrl);
      
      // JSON parsing is important!
      const session = JSON.parse(result) as CheckoutSession;
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StripeSessionStatus | null>({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if completed or failed
      if (data?.__kind__ === 'completed' || data?.__kind__ === 'failed') {
        return false;
      }
      // Poll every 2 seconds while pending
      return 2000;
    },
  });
}
