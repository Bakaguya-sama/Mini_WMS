import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { refreshTokens, getProfile } from '../api/loginApi'
import { Loader2 } from 'lucide-react'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider wraps the application and handles session restoration on mount (e.g. F5).
 * It attempts to silently refresh the token using the HttpOnly cookie.
 * If successful, it fetches the user profile and updates the authStore.
 * The children are only rendered once this initialization process completes (success or failure).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // 1. Attempt silent refresh using HttpOnly cookie
        const refreshRes = await refreshTokens()
        const { accessToken } = refreshRes

        // We must temporarily set accessToken in store so getProfile request will have it
        useAuthStore.getState().updateTokens(accessToken)

        // 2. Fetch user profile with the new accessToken
        const user = await getProfile()

        // 3. Fully populate the store
        if (mounted) {
          setAuth(accessToken, user)
          setIsReady(true)
        }
      } catch (error) {
        // Silent failure is expected if cookie is missing/expired
        if (mounted) {
          clearAuth()
          setIsReady(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
