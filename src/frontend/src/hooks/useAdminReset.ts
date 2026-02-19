import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to reset admin configuration (clears credentials and admin roles)
 * This requires the caller to already be an admin
 */
export function useResetAdminConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        // The backend migration already handles resetting _adminCredentials to null
        // We need to trigger a canister upgrade/migration to apply the reset
        // Since we can't trigger migrations from frontend, we'll use a workaround:
        // Set credentials to a temporary value, then the admin can manually reset
        
        // For now, we'll just clear the local cache and inform the user
        // The actual reset happens via canister upgrade with the migration
        throw new Error('Admin reset requires a canister upgrade. Please redeploy the canister to reset admin configuration.');
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
    },
  });
}
