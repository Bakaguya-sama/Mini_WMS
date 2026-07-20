import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WarehouseBreakdown } from "../types";

/** Format currency for table cells */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface WarehouseBreakdownTableProps {
  data: WarehouseBreakdown[];
}

/**
 * Breakdown table shown to Admin when viewing system-wide financial report
 * (i.e. when no warehouseId filter is applied).
 * Per api-docs.json: byWarehouse[] is only present in that scenario.
 */
export function WarehouseBreakdownTable({
  data,
}: WarehouseBreakdownTableProps) {
  if (!data || data.length === 0) return null;

  const totalRevenue = data.reduce(
    (sum, row) => sum + Number(row.totalRevenue),
    0,
  );
  const totalPackages = data.reduce((sum, row) => sum + row.totalPackages, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Doanh thu theo kho
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Mã kho
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Kiện hàng
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.warehouseId}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    idx % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {row.warehouseId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {row.totalPackages.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(row.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/20 font-bold">
                <td className="px-4 py-3 text-muted-foreground">Tổng cộng</td>
                <td className="px-4 py-3 text-right">
                  {totalPackages.toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600">
                  {formatCurrency(totalRevenue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
