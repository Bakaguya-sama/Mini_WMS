import { AuthenticatedUser } from "@/shared/types/jwt.types";
import { warehouseRepository } from "./warehouse.repository";
import { AppError } from "@/shared/errors/AppError";
import {
  canViewWarehouseTargetIncludingStaff,
  canManageWarehouseTarget,
} from "@/shared/utils/canManage";
import { CreateWarehouseDto, UpdateWarehouseDto } from "./warehouse.dto";
import { WarehouseFilter } from "./warehouse.dto";
import { Role } from "@mini-wms/shared-types";

class WarehouseService {
  async findWarehouseById(id: string, currentUser: AuthenticatedUser) {
    const target = await warehouseRepository.findWarehouseById(id);
    if (!target) throw new AppError(404, "Warehouse does not exist");

    canViewWarehouseTargetIncludingStaff(currentUser, target);

    return target;
  }

  async findWarehousesByFilter(filter: WarehouseFilter) {
    return await warehouseRepository.findWarehouseByFilter(filter);
  }

  async createWarehouse(dto: CreateWarehouseDto) {
    const existingWarehouse = await warehouseRepository.findWarehouseByName(
      dto.name,
    );
    if (existingWarehouse)
      throw new AppError(409, "Name of warehouse already existed");

    return await warehouseRepository.createWarehouse({
      ...dto,
    });
  }

  async updateWarehouse(
    id: string,
    dto: UpdateWarehouseDto,
    currentUser: AuthenticatedUser,
  ) {
    const target = await warehouseRepository.findWarehouseById(id);
    if (!target) throw new AppError(404, "Warehouse does not exist");

    canManageWarehouseTarget(currentUser, target);

    if (dto.name !== undefined) {
      const existingWarehouse = await warehouseRepository.findWarehouseByName(
        dto.name,
      );
      if (existingWarehouse)
        throw new AppError(409, "Name of warehouse already existed");
    }

    return await warehouseRepository.updateWarehouse(id, { ...dto });
  }

  async deleteWarehouse(id: string, currentUser: AuthenticatedUser) {
    const target = await warehouseRepository.findWarehouseById(id);
    if (!target) throw new AppError(404, "Warehouse does not exist");

    if (currentUser.role !== Role.ADMIN)
      throw new AppError(403, "Only Admin can delete warehouse");

    const [userCount, packageCount] = await Promise.all([
      warehouseRepository.countRelatedUsers(target.id),
      warehouseRepository.countRelatedPackages(target.id),
    ]);

    if (userCount > 0 || packageCount > 0) {
      throw new AppError(
        409,
        `Cannot delete warehouse with ${userCount} active user(s) and ${packageCount} package(s). Reassign or remove them first.`,
      );
    }

    await warehouseRepository.deleteWarehouse(id);
  }
}

export const warehouseService = new WarehouseService();
