import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { dashboardService } from "./dashboard.service";
import { success } from "@/shared/utils/responseFormatter";
import { TotalOfPackageFilter } from "../package/package.dto";

class DashboardController {
  getFinancialReport() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await dashboardService.getFinancialReport(
        req.query as unknown as TotalOfPackageFilter,
        req.user!,
      );

      res.status(200).json(success(result));
    });
  }
}

export const dashboardController = new DashboardController();
