import { Badge } from '@/components/ui/badge'
import { PackageStatus } from '../types'

const STATUS_CONFIG: Record<PackageStatus, { label: string; className: string }> = {
  [PackageStatus.PENDING]: {
    label: 'Chờ xử lý',
    className: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  },
  [PackageStatus.IN_TRANSIT]: {
    label: 'Đang giao',
    className: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  },
  [PackageStatus.DELIVERED]: {
    label: 'Đã giao',
    className: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  },
  [PackageStatus.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-red-500/20 text-red-700 border-red-500/30',
  },
}

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, className: '' }
  return (
    <Badge variant="outline" className={`text-xs font-semibold ${config.className}`}>
      {config.label}
    </Badge>
  )
}
