import z from "zod";

export const getFinancialReportSchema = z.object({
  query: z.object({
    warehouseId: z.uuid("Invalid warehouse ID filter").optional(),
  }),
});

export type FinancialReportFilter = z.infer<
  typeof getFinancialReportSchema
>["query"];
