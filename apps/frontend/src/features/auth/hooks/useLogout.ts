import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/loginApi'
import { useAuthStore } from '@/store/authStore'

/**
 * Hook for the logout mutation.
 *
 * Flow per CONTEXT.md §5:
 * 1. Call POST /auth/logout (revoke refresh token server-side)
 * 2. On settled (success OR error): clear auth state + clear query cache + redirect to /login
 *
 * We use onSettled (not onSuccess) so that even if the network fails,
 * the user is still logged out client-side.
 */
export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Always clear local state regardless of server response
      clearAuth()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
