import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackageStatusCount } from "../types";

// ─── Status display config — per CONTEXT §11 color rules ─────────────────────
const STATUS_CONFIG: Record<
  PackageStatusCount["status"],
  { label: string; badgeClass: string; rowClass: string }
> = {
  DELIVERED: {
    label: "Đã giao",
    badgeClass:
      "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
    rowClass: "border-l-emerald-500",
  },
  IN_TRANSIT: {
    label: "Đang vận chuyển",
    badgeClass:
      "bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
    rowClass: "border-l-amber-500",
  },
  PENDING: {
    label: "Chờ xử lý",
    badgeClass:
      "bg-blue-500/20 text-blue-600 border-blue-500/30 hover:bg-blue-500/20",
    rowClass: "border-l-blue-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeClass:
      "bg-red-500/20 text-red-600 border-red-500/30 hover:bg-red-500/20",
    rowClass: "border-l-red-500",
  },
};

// Canonical display order
const STATUS_ORDER: PackageStatusCount["status"][] = [
  "DELIVERED",
  "IN_TRANSIT",
  "PENDING",
  "CANCELLED",
];

interface PackageStatusReportProps {
  data: PackageStatusCount[];
}

/**
 * Displays package count breakdown by status.
 * Per CONTEXT §11: badge-list style, NO chart. Colors per semantic token rules.
 */
export function PackageStatusReport({ data }: PackageStatusReportProps) {
  // Build a map for O(1) lookup
  const countMap = Object.fromEntries(data.map((d) => [d.status, d.count]));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Tình trạng kiện hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {STATUS_ORDER.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = countMap[status] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={status}
              className={`flex items-center justify-between p-3 rounded-lg border border-l-4 bg-card ${cfg.rowClass}`}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${cfg.badgeClass}`}
                >
                  {cfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-sm font-semibold text-muted-foreground w-10">
                  {pct}%
                </span>
                <span className="text-2xl font-black text-foreground min-w-[3rem] text-right">
                  {count.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          );
        })}

        {total > 0 && (
          <div className="flex justify-between items-center pt-3 border-t-2 border-border mt-1">
            <span className="text-muted-foreground font-bold text-base">Tổng cộng</span>
            <span className="font-black text-3xl text-primary">
              {total.toLocaleString("vi-VN")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
