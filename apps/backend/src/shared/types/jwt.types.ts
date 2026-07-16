import { Role } from "@mini-wms/shared-types";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: Role;
  warehouseId: string | null;
}

export interface RefreshTokenPayload {
  sub: string;
}
