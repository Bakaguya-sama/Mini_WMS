import { AuthenticatedUser } from "@/shared/types/jwt.types";
import { packageRepository } from "./package.repository";
import { AppError } from "@/shared/errors/AppError";
import {
  canManagePackageTarget,
  canManagePackageTargetIncludingStaff,
  canViewPackageTargetIncludingStaff,
} from "@/shared/utils/canManage";
import { PackageFilter } from "./package.dto";
import { PackageStatus, Role, VALID_TRANSITIONS } from "@mini-wms/shared-types";
import { CreatePackageDto, UpdatePackageDto } from "./package.dto";
import { warehouseRepository } from "../warehouse/warehouse.repository";

class PackageService {
  async findPackageById(id: string, currentUser: AuthenticatedUser) {
    const target = await packageRepository.findPackageById(id);
    if (!target) throw new AppError(404, "Package does not exist");

    canViewPackageTargetIncludingStaff(currentUser, target);

    return target;
  }

  async findPackagesByFilter(
    filter: PackageFilter,
    currentUser: AuthenticatedUser,
  ) {
    const scopedFilter: PackageFilter = { ...filter };

    if (currentUser.role === Role.MANAGER || currentUser.role === Role.STAFF)
      scopedFilter.warehouseId = currentUser.warehouseId!;

    return await packageRepository.findPackagesByFilter(scopedFilter);
  }

  async createPackage(dto: CreatePackageDto, currentUser: AuthenticatedUser) {
    if (currentUser.role === Role.MANAGER) {
      if (dto.warehouseId !== currentUser.warehouseId) {
        throw new AppError(
          403,
          "Manager can only create package in their own warehouses",
        );
      }
    }

    const warehouse = await warehouseRepository.findWarehouseById(
      dto.warehouseId,
    );
    if (!warehouse) throw new AppError(404, "Warehouse does not exist");

    const existing = await packageRepository.findPackageByCode(dto.code);
    if (existing) throw new AppError(409, "Code of package already exists");

    return packageRepository.createPackage(dto);
  }

  async updatePackage(
    id: string,
    dto: UpdatePackageDto,
    currentUser: AuthenticatedUser,
  ) {
    const target = await packageRepository.findPackageById(id);
    if (!target) throw new AppError(404, "Package does not exist");

    canManagePackageTargetIncludingStaff(currentUser, target);

    const isEditingRestrictedFields =
      dto.code !== undefined ||
      dto.price !== undefined ||
      dto.warehouseId !== undefined;
    if (isEditingRestrictedFields && currentUser.role === Role.STAFF) {
      throw new AppError(403, "Staff can only update package status");
    }

    if (
      dto.warehouseId !== undefined &&
      dto.warehouseId !== currentUser.warehouseId
    ) {
      if (currentUser.role === Role.MANAGER)
        throw new AppError(
          403,
          "Manager cannot transfer package to another warehouse",
        );

      const destinationWarehouse = await warehouseRepository.findWarehouseById(
        dto.warehouseId,
      );
      if (!destinationWarehouse) {
        throw new AppError(404, "Destination warehouse does not exist");
      }
    }

    if (dto.status !== undefined && dto.status !== target.status) {
      if (!VALID_TRANSITIONS[target.status].includes(dto.status)) {
        throw new AppError(
          400,
          `Cannot transition from ${target.status} to ${dto.status}`,
        );
      }
    }

    const { version, ...updateData } = dto;

    const updated = await packageRepository.updatePackage(
      id,
      dto.version,
      updateData,
    );

    if (!updated)
      throw new AppError(409, "Package was updated by someone else");

    return updated;
  }

  async deletePackage(id: string, currentUser: AuthenticatedUser) {
    const target = await packageRepository.findPackageById(id);
    if (!target) throw new AppError(404, "Package does not exist");

    canManagePackageTarget(currentUser, target);

    if (target.status === PackageStatus.DELIVERED) {
      throw new AppError(409, "Cannot delete a delivered package");
    }

    await packageRepository.deletePackage(target.id);
  }
}

export const packageService = new PackageService();
