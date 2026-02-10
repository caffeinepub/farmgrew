import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Customer } from '../backend';

export function useCustomerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<Customer | null>({
    queryKey: ['customerProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        const principal = await actor.getIdForCaller();
        return await actor.getCustomerByPrincipal(principal);
      } catch (error) {
        // Customer not registered yet
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  const isProfileComplete = query.data !== null;

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    isProfileComplete,
  };
}

export function useRegisterCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; phoneNumber: string; pickupAddress: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerCustomer(data.name, data.phoneNumber, data.pickupAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
  });
}
