import { Badge } from '@/components/ui/badge'
import { PackageStatus } from '../types'

export const STATUS_CONFIG: Record<PackageStatus, { label: string; className: string; textColor: string }> = {
  [PackageStatus.PENDING]: {
    label: 'CHỜ XỬ LÝ',
    className: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    textColor: 'text-amber-700',
  },
  [PackageStatus.IN_TRANSIT]: {
    label: 'ĐANG GIAO',
    className: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    textColor: 'text-blue-700',
  },
  [PackageStatus.DELIVERED]: {
    label: 'ĐÃ GIAO',
    className: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
    textColor: 'text-emerald-700',
  },
  [PackageStatus.CANCELLED]: {
    label: 'ĐÃ HỦY',
    className: 'bg-red-500/20 text-red-700 border-red-500/30',
    textColor: 'text-red-700',
  },
}

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, className: '', textColor: '' }
  return (
    <Badge variant="outline" className={`text-sm uppercase font-bold tracking-wide ${config.className}`}>
      {config.label}
    </Badge>
  )
}
