import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login } from '../api/loginApi'
import { useAuthStore } from '@/store/authStore'
import type { LoginInput } from '../types'

/**
 * Hook for the login mutation.
 *
 * On success: stores tokens + user in authStore, navigates to /dashboard.
 * On error: toast is shown by axiosClient interceptor — no duplicate here.
 */
export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (responseData) => {
      const { accessToken, refreshToken, user } = responseData
      setAuth(accessToken, refreshToken, user)
      toast.success(`Chào mừng trở lại, ${user.username}!`)
      navigate('/dashboard', { replace: true })
    },
    // onError is intentionally not handled here —
    // axiosClient interceptor already shows the server error toast.
  })
}
