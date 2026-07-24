import { useMutation } from '@tanstack/react-query'
import { axiosClient } from '@/api/axiosClient'

export function useResetPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosClient.post<{ data: { tempPassword: string } }>(`/users/${id}/reset-password`)
      return data.data
    },
  })
}