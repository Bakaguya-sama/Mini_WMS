import { AuthenticatedUser } from "@/shared/types/jwt.types";
import { packageRepository } from "../package/package.repository";
import { FinancialReportFilter } from "./dashboard.dto";
import { Role } from "@mini-wms/shared-types";
import { warehouseRepository } from "../warehouse/warehouse.repository";
import { AppError } from "@/shared/errors/AppError";

class DashboardService {
  async getFinancialReport(
    filter: FinancialReportFilter,
    currentUser: AuthenticatedUser,
  ) {
    const scopedFilter = { ...filter };

    if (currentUser.role === Role.MANAGER) {
      scopedFilter.warehouseId = currentUser.warehouseId!;
    }

    if (scopedFilter.warehouseId) {
      const warehouse = await warehouseRepository.findWarehouseById(
        scopedFilter.warehouseId,
      );
      if (!warehouse) throw new AppError(404, "Warehouse does not exist");
    }

    return await packageRepository.calculateTotalOfPackageByFilter(
      scopedFilter,
    );
  }
}

export const dashboardService = new DashboardService();
