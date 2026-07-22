import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateProfile, UpdateProfileInput } from '../api/profileApi'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'

/**
 * Hook for updating the authenticated user's own profile.
 *
 * On success:
 * - Shows success toast
 * - Updates username/email in the Zustand auth store (so Header reflects changes immediately)
 * - Calls onSuccess callback (used by ProfileDialog to close itself)
 */
export function useUpdateProfile(options?: { onSuccess?: () => void }) {
  const { user, setAuth, accessToken } = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (updatedUser) => {
      // Sync the updated user info back into the auth store
      if (user && accessToken) {
        setAuth(accessToken, {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role as Role,
          warehouseId: updatedUser.warehouseId,
        })
      }
      toast.success('Hồ sơ đã được cập nhật thành công!')
      options?.onSuccess?.()
    },
    // onError: axiosClient interceptor already shows server error toast
  })
}
