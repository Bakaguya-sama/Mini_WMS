import { TrendingUp, Package } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FinancialReportCardProps {
  totalRevenue: number
  totalPackages: number
  /** If true, show Revenue card. Staff = false (hidden per CONTEXT §8). */
  showRevenue: boolean
}

/** Format a number as Vietnamese currency (VND-style) */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Financial report stat cards.
 * - Shows "Tổng doanh thu" (Admin/Manager) + "Tổng kiện hàng" (all roles)
 * - Staff: only "Tổng kiện hàng" card is displayed.
 * - Numbers use text-3xl/text-4xl per CONTEXT §11.
 */
export function FinancialReportCard({
  totalRevenue,
  totalPackages,
  showRevenue,
}: FinancialReportCardProps) {
  return (
    <div className={`grid gap-4 ${showRevenue ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
      {/* Tổng doanh thu — Admin/Manager only */}
      {showRevenue && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng giá trị kiện hàng DELIVERED
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tổng kiện hàng — all roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng kiện hàng
          </CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-foreground tracking-tight">
            {totalPackages.toLocaleString('vi-VN')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tất cả kiện hàng trong hệ thống
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
