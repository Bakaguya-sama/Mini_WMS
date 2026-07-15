import { prisma } from "@/config/db.config";
import { Prisma } from "generated/prisma";
import { WarehouseFilter } from "./warehouse.dto";

const warehouseSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WarehouseSelect;

class WarehouseRepository {
  async findWarehouseById(id: string) {
    return await prisma.warehouse.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: warehouseSelect,
    });
  }

  async findWarehouseByName(name: string) {
    return await prisma.warehouse.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  async findWarehouseByFilter(filter: WarehouseFilter) {
    const { search, page, limit } = filter;

    const where: Prisma.WarehouseWhereInput = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    };

    const [data, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          name: "asc",
        },
        select: warehouseSelect,
      }),
      prisma.warehouse.count({
        where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async createWarehouse(data: Prisma.WarehouseCreateInput) {
    return await prisma.warehouse.create({
      data,
      select: warehouseSelect,
    });
  }

  async updateWarehouse(id: string, data: Prisma.WarehouseUpdateInput) {
    const result = await prisma.warehouse.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    if (result.count === 0) return null;
    return this.findWarehouseById(id);
  }

  async deleteWarehouse(id: string) {
    await prisma.warehouse.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async countRelatedUsers(id: string) {
    return await prisma.user.count({
      where: {
        warehouseId: id,
        deletedAt: null,
      },
    });
  }

  async countRelatedPackages(id: string) {
    return await prisma.package.count({
      where: {
        warehouseId: id,
        deletedAt: null,
      },
    });
  }
}

export const warehouseRepository = new WarehouseRepository();
export type SafeWarehouse = Prisma.WarehouseGetPayload<{
  select: typeof warehouseSelect;
}>;
