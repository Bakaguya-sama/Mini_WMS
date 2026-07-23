import { QueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/store/uiStore'

/**
 * React Query global configuration.
 *
 * Per CONTEXT.md §7 (Data Freshness):
 * - refetchInterval: 10000 — poll every 10 seconds, BUT paused when user is interacting.
 * - refetchOnWindowFocus: true — refresh stale data when user returns to tab
 * - No WebSocket/SSE — polling is the intentional design decision
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: () => (useUIStore.getState().isInteracting ? false : 10_000),
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 5_000,
    },
    mutations: {
      retry: 0,
    },
  },
})
