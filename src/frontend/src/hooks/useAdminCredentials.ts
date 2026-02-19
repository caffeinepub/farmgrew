import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useUpdateAdminCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.updateAdminCredentials(credentials.username, credentials.password);
      } catch (error: any) {
        // Map backend error messages to user-friendly English
        const message = error.message || '';
        if (message.includes('Unauthorized')) {
          throw new Error('You do not have permission to update admin credentials.');
        } else {
          throw new Error('Failed to update credentials. Please try again.');
        }
      }
    },
    onSuccess: () => {
      // Invalidate admin status queries after credential rotation
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
