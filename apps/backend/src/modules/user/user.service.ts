import { AppError } from "@/shared/errors/AppError";
import { userRepository, type SafeUser } from "./user.repository";
import { mapPrismaRole } from "@/shared/utils/mapPrismaRole";
import { Prisma } from "generated/prisma";
import { UserFilter } from "./user.dto";
import { AuthenticatedUser } from "@/shared/types/jwt.types";
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
} from "./user.dto";
import { Role } from "@mini-wms/shared-types";
import {
  canManageUserTarget,
  canViewUserTarget,
} from "@/shared/utils/canManage";
import bcrypt from "bcrypt";
import { warehouseRepository } from "../warehouse/warehouse.repository";

class UserService {
  mapUserToResponse(user: SafeUser) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: mapPrismaRole(user.role),
      warehouseId: user.warehouseId,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserById(id: string, currentUser: AuthenticatedUser) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    if (target.id === currentUser.sub) return this.mapUserToResponse(target);

    canViewUserTarget(currentUser, target);

    return this.mapUserToResponse(target);
  }

  async createUser(dto: CreateUserDto, currentUser: AuthenticatedUser) {
    if (currentUser.role === Role.MANAGER) {
      if (
        dto.role !== Role.STAFF ||
        dto.warehouseId !== currentUser.warehouseId
      ) {
        throw new AppError(
          403,
          "Manager can only create staff in own warehouse",
        );
      }
    }

    const existing = await userRepository.findUserByEmail(dto.email);
    if (existing) throw new AppError(409, "Email already registered");

    if (dto.warehouseId !== undefined) {
      const warehouse = await warehouseRepository.findWarehouseById(
        dto.warehouseId!,
      );
      if (!warehouse) throw new AppError(404, "Warehouse does not exist");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const created = await userRepository.createUser({
      ...dto,
      password: hashedPassword,
    });
    return this.mapUserToResponse(created);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    canManageUserTarget(currentUser, target);

    if (currentUser.role === Role.MANAGER) {
      if (dto.role !== undefined && dto.role !== Role.STAFF) {
        throw new AppError(403, "Manager can only manage Staff role");
      }
      if (
        dto.warehouseId !== undefined &&
        dto.warehouseId !== currentUser.warehouseId
      ) {
        throw new AppError(
          403,
          "Manager cannot transfer employees to another warehouse",
        );
      }
    }

    const finalRole = dto.role ?? target.role;
    const finalWarehouseId =
      dto.warehouseId !== undefined ? dto.warehouseId : target.warehouseId;

    if (finalRole === Role.ADMIN && finalWarehouseId) {
      throw new AppError(400, "Admin cannot have a warehouseId");
    }
    if (finalRole !== Role.ADMIN && !finalWarehouseId) {
      throw new AppError(400, "Manager/Staff must have a warehouseId");
    }

    if (
      dto.warehouseId !== undefined &&
      dto.warehouseId !== target.warehouseId
    ) {
      const warehouse = await warehouseRepository.findWarehouseById(
        dto.warehouseId!,
      );
      if (!warehouse) throw new AppError(404, "Warehouse does not exist");
    }

    if (dto.email !== undefined && dto.email !== target.email) {
      const existing = await userRepository.findUserByEmail(dto.email);
      if (existing) throw new AppError(409, "Email already registered");
    }

    const dataToUpdate = { ...dto };
    const updated = await userRepository.updateUser(id, dataToUpdate);
    if (!updated) throw new AppError(404, "User does not exist");
    return this.mapUserToResponse(updated);
  }

  async resetPasswordForEmployee(id: string, currentUser: AuthenticatedUser) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    canManageUserTarget(currentUser, target);

    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.updateUser(id, {
      password: await bcrypt.hash(tempPassword, 10),
    });

    return { tempPassword };
  }

  async getProfile(currentUser: AuthenticatedUser) {
    const user = await userRepository.findUserById(currentUser.sub);
    if (!user) throw new AppError(404, "User does not exist");
    return this.mapUserToResponse(user);
  }

  async updateProfile(dto: UpdateProfileDto, currentUser: AuthenticatedUser) {
    const dataToUpdate: Prisma.UserUpdateInput = { ...dto };

    if (dto.email) {
      const existing = await userRepository.findUserByEmail(dto.email);
      if (existing && existing.id !== currentUser.sub) {
        throw new AppError(409, "Email already registered");
      }
    }

    if (dto.password) {
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await userRepository.updateUser(
      currentUser.sub,
      dataToUpdate,
    );
    if (!updated) throw new AppError(404, "User does not exist");

    return this.mapUserToResponse(updated);
  }

  async banUser(id: string, currentUser: AuthenticatedUser) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    canManageUserTarget(currentUser, target);

    if (target.id === currentUser.sub) {
      throw new AppError(400, "Cannot ban yourself");
    }
    if (target.isBanned) {
      throw new AppError(409, "Account is already banned");
    }

    const updated = await userRepository.banUser(id);
    return this.mapUserToResponse(updated);
  }

  async unbanUser(id: string, currentUser: AuthenticatedUser) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    canManageUserTarget(currentUser, target);

    if (!target.isBanned) {
      throw new AppError(409, "Account is not banned");
    }

    const updated = await userRepository.unbanUser(id);
    return this.mapUserToResponse(updated);
  }

  async deleteUser(id: string, currentUser: AuthenticatedUser) {
    const target = await userRepository.findUserById(id);
    if (!target) throw new AppError(404, "User does not exist");

    canManageUserTarget(currentUser, target);

    const deleted = await userRepository.deleteUser(id);
    if (!deleted) throw new AppError(409, "Cannot delete this user");
  }

  async getUsersByFilter(filter: UserFilter, currentUser: AuthenticatedUser) {
    const scopedFilter: UserFilter = { ...filter };

    if (currentUser.role === Role.MANAGER) {
      scopedFilter.warehouseId = currentUser.warehouseId!;
    }

    const { data, total, page, limit } =
      await userRepository.findUsersByFilter(scopedFilter);
    return {
      data: data.map((user) => ({ ...user, role: mapPrismaRole(user.role) })),
      total,
      page,
      limit,
    };
  }
}

export const userService = new UserService();
