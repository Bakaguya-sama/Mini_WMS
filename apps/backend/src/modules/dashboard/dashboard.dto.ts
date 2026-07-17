import z from "zod";

const dashboardReportSchema = z.object({
  query: z.object({
    warehouseId: z.uuid("Invalid warehouse ID filter").optional(),
  }),
});

export const getFinancialReportSchema = dashboardReportSchema;
export const getPackageStatusReportSchema = dashboardReportSchema;

export type FinancialReportFilter = z.infer<
  typeof getFinancialReportSchema
>["query"];
