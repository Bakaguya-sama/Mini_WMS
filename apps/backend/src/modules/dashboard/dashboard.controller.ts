import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { dashboardService } from "./dashboard.service";
import { success } from "@/shared/utils/responseFormatter";
import { FinancialReportFilter } from "./dashboard.dto";

class DashboardController {
  getFinancialReport() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await dashboardService.getFinancialReport(
        req.query as unknown as FinancialReportFilter,
        req.user,
      );

      res.status(200).json(success(result));
    });
  }

  getPackageStatusReport() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await dashboardService.getPackageStatusReport(
        req.query as unknown as FinancialReportFilter,
        req.user,
      );

      res.status(200).json(success(result));
    });
  }
}

export const dashboardController = new DashboardController();
