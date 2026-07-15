import { AuthenticatedUser } from "../types/jwt.types";
import { Role } from "@mini-wms/shared-types";
import { AppError } from "../errors/AppError";
import { type SafeUser } from "@/modules/user/user.repository";
import { type SafeWarehouse } from "@/modules/warehouse/warehouse.repository";

export function canManageUserTarget(
  currentUser: AuthenticatedUser,
  target: SafeUser,
) {
  if (currentUser.sub === target.id) {
    throw new AppError(403, "Cannot manage your own account");
  }

  if (currentUser.role === Role.ADMIN) return;

  if (
    currentUser.role === Role.MANAGER &&
    target.role === Role.STAFF &&
    target.warehouseId === currentUser.warehouseId
  ) {
    return;
  }

  throw new AppError(403, "Cannot manage this user");
}

export function canViewUserTarget(
  currentUser: AuthenticatedUser,
  target: SafeUser,
) {
  if (currentUser.sub === target.id) return;

  if (currentUser.role === Role.ADMIN) return;

  if (
    currentUser.role === Role.MANAGER &&
    target.role === Role.STAFF &&
    target.warehouseId === currentUser.warehouseId
  ) {
    return;
  }

  throw new AppError(403, "Cannot view this user");
}

export function canManageWarehouseTarget(
  currentUser: AuthenticatedUser,
  target: SafeWarehouse,
) {
  if (currentUser.role === Role.ADMIN) return;

  if (
    currentUser.role === Role.MANAGER &&
    target.id === currentUser.warehouseId
  ) {
    return;
  }

  throw new AppError(403, "Cannot manage this warehouse");
}

export function canViewWarehouseTargetIncludingStaff(
  currentUser: AuthenticatedUser,
  target: SafeWarehouse,
) {
  if (currentUser.role === Role.ADMIN) return;

  if (
    currentUser.role === Role.MANAGER &&
    target.id === currentUser.warehouseId
  ) {
    return;
  }

  if (
    currentUser.role === Role.STAFF &&
    target.id === currentUser.warehouseId
  ) {
    return;
  }

  throw new AppError(403, "Cannot view this warehouse");
}
