import { prisma } from "@/config/db.config";
import { Prisma } from "generated/prisma";
import { PackageFilter } from "./package.dto";

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
    return prisma.package.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export const packageRepository = new PackageRepository();
export type SafePackage = Prisma.PackageGetPayload<{
  select: typeof packageSelect;
}>;
