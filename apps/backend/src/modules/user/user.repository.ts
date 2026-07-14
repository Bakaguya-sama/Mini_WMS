import { prisma } from "@/config/db.config";
import { Prisma } from "generated/prisma";
import { UserFilter } from "./user.types";

const userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  isBanned: true,
  warehouseId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userSelectWithPassword = {
  ...userSelect,
  password: true,
} satisfies Prisma.UserSelect;

class UserRepository {
  async findUserById(id: string) {
    return await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  async findUserByEmailWithPassword(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: userSelectWithPassword,
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
        select: userSelect,
        skip: (page - 1) * limit,
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
      select: userSelect,
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
      select: userSelect,
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
      select: userSelect,
    });
  }

  async deleteUser(id: string) {
    await prisma.user.update({
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
export type SafeUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;
