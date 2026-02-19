import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to check if admin credentials are currently configured
 */
export function useIsAdminConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdminConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAdminConfigured();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

/**
 * Hook to set initial admin credentials (only works when no credentials are configured)
 */
export function useSetInitialAdminCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.initializeAdminAccess(credentials.username, credentials.password);
      } catch (error: any) {
        const message = error.message || '';
        
        if (message.includes('Admin is already configured')) {
          throw new Error('Admin credentials are already configured. Please use the admin login form.');
        } else if (message.includes('Username and password must not be empty')) {
          throw new Error('Username and password cannot be empty.');
        } else if (message.includes('Unauthorized')) {
          throw new Error('You must be logged in with Internet Identity to set up admin credentials.');
        } else {
          throw new Error(message || 'Failed to set initial admin credentials. Please try again.');
        }
      }
    },
    onSuccess: () => {
      // Invalidate all admin-related queries
      queryClient.invalidateQueries({ queryKey: ['isAdminConfigured'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
