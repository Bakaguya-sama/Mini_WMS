import { AppError } from "@/shared/errors/AppError";
import { userRepository } from "../user/user.repository";
import { jwtService } from "@/shared/utils/jwt";
import bcrypt from "bcrypt";
import { mapPrismaRole } from "@/shared/utils/mapPrismaRole";
import { hashToken } from "@/shared/utils/hashToken";

class AuthenticationService {
  async login(email: string, password: string) {
    const existingUser =
      await userRepository.findUserByEmailWithPassword(email);

    if (
      !existingUser ||
      !(await bcrypt.compare(password, existingUser.password))
    )
      throw new AppError(401, "Invalid email or password");

    if (existingUser.isBanned) throw new AppError(403, "Account is banned");

    const { accessToken, refreshToken } = await jwtService.generateTokenPair({
      id: existingUser.id,
      email,
      role: mapPrismaRole(existingUser.role),
    });

    await userRepository.setRefreshTokenHash(
      existingUser.id,
      hashToken(refreshToken),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        role: mapPrismaRole(existingUser.role),
        warehouseId: existingUser.warehouseId,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new AppError(401, "No refresh token");
    let payload;
    try {
      payload = jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const existingUser = await userRepository.findUserByIdWithRefreshHash(
      payload.sub,
    );
    if (!existingUser) throw new AppError(401, "User does not exist");
    if (existingUser.isBanned) throw new AppError(403, "Account is banned");

    const incomingHash = hashToken(refreshToken);
    if (existingUser.refreshTokenHash !== incomingHash) {
      throw new AppError(401, "Refresh token has been revoked");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      jwtService.generateTokenPair({
        id: existingUser.id,
        email: existingUser.email,
        role: mapPrismaRole(existingUser.role),
      });

    await userRepository.setRefreshTokenHash(
      existingUser.id,
      hashToken(newRefreshToken),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await userRepository.setRefreshTokenHash(userId, null);
  }
}

export const authenticationService = new AuthenticationService();
