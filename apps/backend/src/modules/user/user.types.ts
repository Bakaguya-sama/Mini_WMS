import { Role } from "@mini-wms/shared-types";

export interface UserFilter {
  warehouseId?: string;
  role?: Role;
  isBanned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
