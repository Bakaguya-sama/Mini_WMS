import { prisma } from "@/config/db.config";
import { Prisma } from "generated/prisma";
import { PackageFilter } from "./package.dto";
import { FinancialReportFilter } from "../dashboard/dashboard.dto";
import { PackageStatus } from "@mini-wms/shared-types";

const packageSelect = {
  id: true,
  code: true,
  price: true,
  warehouseId: true,
  status: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PackageSelect;

class PackageRepository {
  async findPackageById(id: string) {
    return await prisma.package.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: packageSelect,
    });
  }

  async findPackageByCode(code: string) {
    return await prisma.package.findFirst({
      where: {
        code,
        deletedAt: null,
      },
      select: packageSelect,
    });
  }

  async findPackagesByFilter(filter: PackageFilter) {
    const { warehouseId, status, search, sortBy, sortOrder, page, limit } =
      filter;

    const where: Prisma.PackageWhereInput = {
      deletedAt: null,
      ...(warehouseId && { warehouseId }),
      ...(status && { status }),
      ...(search && { code: { contains: search, mode: "insensitive" } }),
    };

    const [data, total] = await Promise.all([
      prisma.package.findMany({
        where,
        select: packageSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.package.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createPackage(data: Prisma.PackageUncheckedCreateInput) {
    return await prisma.package.create({
      data,
      select: packageSelect,
    });
  }

  async updatePackage(
    id: string,
    expectedVersion: number,
    data: Omit<Prisma.PackageUncheckedUpdateInput, "version">,
  ) {
    const result = await prisma.package.updateMany({
      where: { id, version: expectedVersion, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
    });

    if (result.count === 0) return null;
    return this.findPackageById(id);
  }

  async deletePackage(id: string) {
    const result = await prisma.package.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }

  async calculateTotalOfPackageByFilter(filter: FinancialReportFilter) {
    const { warehouseId } = filter;
    const baseWhere: Prisma.PackageWhereInput = {
      deletedAt: null,
      ...(warehouseId && { warehouseId }),
    };

    const [totalPackages, revenueAgg] = await Promise.all([
      prisma.package.count({ where: baseWhere }),
      prisma.package.aggregate({
        where: { ...baseWhere, status: PackageStatus.DELIVERED },
        _sum: { price: true },
      }),
    ]);

    const overall = {
      totalPackages,
      totalRevenue: revenueAgg._sum.price ?? 0,
    };

    if (!warehouseId) {
      const [byWarehouse, revenueByWarehouse] = await Promise.all([
        prisma.package.groupBy({
          by: ["warehouseId"],
          where: {
            deletedAt: null,
          },
          _count: { _all: true },
        }),
        prisma.package.groupBy({
          by: ["warehouseId"],
          where: { deletedAt: null, status: PackageStatus.DELIVERED },
          _sum: { price: true },
        }),
      ]);

      const revenueMap = new Map(
        revenueByWarehouse.map((r) => [r.warehouseId, r._sum.price ?? 0]),
      );

      return {
        ...overall,
        byWarehouse: byWarehouse.map((w) => ({
          warehouseId: w.warehouseId,
          totalPackages: w._count._all,
          totalRevenue: revenueMap.get(w.warehouseId) ?? 0,
        })),
      };
    }

    return { warehouseId, ...overall };
  }

  async getPackageStatusBreakdown(filter: FinancialReportFilter) {
    const { warehouseId } = filter;
    const result = await prisma.package.groupBy({
      by: ["status"],
      where: { deletedAt: null, ...(warehouseId && { warehouseId }) },
      _count: { _all: true },
    });

    return result.map((r) => ({ status: r.status, count: r._count._all }));
  }
}

export const packageRepository = new PackageRepository();
export type SafePackage = Prisma.PackageGetPayload<{
  select: typeof packageSelect;
}>;
