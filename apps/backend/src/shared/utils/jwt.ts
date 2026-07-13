import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt.config";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.types";
import { Role } from "@mini-wms/shared-types";

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(
    {
      ...payload,
    },
    jwtConfig.access.secret,
    jwtConfig.access.options,
  );
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(
    {
      ...payload,
    },
    jwtConfig.refresh.secret,
    jwtConfig.refresh.options,
  );
}

export function generateTokenPair(user: {
  id: string;
  email: string;
  role: Role;
  warehouseId: string;
}) {
  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    sub: user.id,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, jwtConfig.access.secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, jwtConfig.refresh.secret) as RefreshTokenPayload;
}
