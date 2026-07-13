import { prisma } from "@/config/db.config";
import { Prisma } from "generated/prisma";
import { UserFilter } from "./user.types";

class UserRepository {
  async findUserById(id: string) {
    return await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findUsersByFilter(filter: UserFilter) {
    const {
      warehouseId,
      role,
      isBanned,
      search,
      page = 1,
      limit = 20,
    } = filter;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(warehouseId && { warehouseId }),
      ...(role && { role }),
      ...(isBanned !== undefined && { isBanned }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: page,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({
        where,
      }),
    ]);

    return { data, total, page, limit };
  }

  async createUser(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    const result = await prisma.user.updateMany({
      where: { id, deletedAt: null },
      data,
    });
    if (result.count === 0) return null;
    return this.findUserById(id);
  }

  async banUser(id: string) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        isBanned: true,
      },
    });
  }

  async unbanUser(id: string) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        isBanned: false,
      },
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export const userRepository = new UserRepository();
