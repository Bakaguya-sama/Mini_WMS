import { User } from "generated/prisma";
import { AuthenticatedUser } from "../types/jwt.types";
import { Role } from "@mini-wms/shared-types";
import { AppError } from "../errors/AppError";
import { type SafeUser } from "@/modules/user/user.repository";

export function canManageTarget(
  currentUser: AuthenticatedUser,
  target: SafeUser,
) {
  if (currentUser.role === Role.ADMIN) return;

  if (
    currentUser.role === Role.MANAGER &&
    target.role === Role.STAFF &&
    target.warehouseId === currentUser.warehouseId
  ) {
    return;
  }

  if (currentUser.sub === target.id) {
    throw new AppError(403, "Cannot manage your own");
  }

  throw new AppError(403, "Cannot access this user");
}
