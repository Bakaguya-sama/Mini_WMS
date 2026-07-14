import { AppError } from "@/shared/errors/AppError";
import { userRepository } from "../user/user.repository";
import { jwtService } from "@/shared/utils/jwt";
import bcrypt from "bcrypt";
import { mapPrismaRole } from "@/shared/utils/mapPrismaRole";

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
}

export const authenticationService = new AuthenticationService();
