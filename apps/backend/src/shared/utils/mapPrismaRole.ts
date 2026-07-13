import { Role } from "@mini-wms/shared-types";
import { UserRole } from "generated/prisma";

export const mapPrismaRole = (role: UserRole): Role => role as unknown as Role;
