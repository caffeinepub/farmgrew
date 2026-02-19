import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserRole } from '../backend';

export function useListAdmins() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['admins'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Get all users with admin role by checking the role
      // Since backend doesn't have a direct listAdmins method, we'll need to track this differently
      // For now, return empty array as placeholder
      // The backend would need a method to list all admins
      return [];
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGrantAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalString: string) => {
      if (!actor) throw new Error('Actor not available');
      
      const principal = Principal.fromText(principalString);
      await actor.grantAdminRole(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useRevokeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.revokeAdminRole(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useCheckUserRole() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principalString: string): Promise<UserRole> => {
      if (!actor) throw new Error('Actor not available');
      
      const principal = Principal.fromText(principalString);
      return await actor.checkUserRole(principal);
    },
  });
}
