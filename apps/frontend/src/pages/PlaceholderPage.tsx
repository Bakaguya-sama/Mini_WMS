import { Package } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  phase: string
}

/**
 * Temporary placeholder for pages not yet built.
 * Used for /packages, /warehouses, /employees during Phase 2.
 * Will be replaced with real page components in Phase 4 & 5.
 */
export function PlaceholderPage({ title, phase }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
        <Package className="w-7 h-7 text-primary/60" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Tính năng này sẽ được xây dựng trong{' '}
          <span className="font-medium text-primary">{phase}</span>.
        </p>
      </div>
    </div>
  )
}
