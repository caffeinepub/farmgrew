import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAuthenticateAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.authenticateAdmin(credentials.username, credentials.password);
      } catch (error: any) {
        // Map backend error messages to user-friendly English
        const message = error.message || '';
        if (message.includes('Credentials not set')) {
          throw new Error('Admin credentials have not been configured yet. Please contact the system administrator.');
        } else if (message.includes('Wrong username or password')) {
          throw new Error('Invalid username or password. Please try again.');
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      }
    },
    onSuccess: () => {
      // Invalidate and refetch admin status after successful authentication
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
