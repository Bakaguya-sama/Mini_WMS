export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export enum PackageStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export const VALID_TRANSITIONS: Record<PackageStatus, PackageStatus[]> = {
  PENDING: ["IN_TRANSIT", "CANCELLED"] as PackageStatus[],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"] as PackageStatus[],
  DELIVERED: [],
  CANCELLED: [],
};
