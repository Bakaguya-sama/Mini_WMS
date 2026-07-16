import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt.config";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.types";
import { Role } from "@mini-wms/shared-types";

class JwtService {
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      {
        ...payload,
      },
      jwtConfig.access.secret,
      jwtConfig.access.options,
    );
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(
      {
        ...payload,
      },
      jwtConfig.refresh.secret,
      jwtConfig.refresh.options,
    );
  }

  generateTokenPair(user: { id: string; email: string; role: Role }) {
    const accessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, jwtConfig.access.secret) as AccessTokenPayload;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, jwtConfig.refresh.secret) as RefreshTokenPayload;
  }
}

export const jwtService = new JwtService();
