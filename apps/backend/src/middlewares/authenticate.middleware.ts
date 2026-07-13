import { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError";
import { verifyAccessToken } from "@/shared/utils/jwt";
import { userRepository } from "@/modules/user/user.repository";
import { Role } from "@mini-wms/shared-types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await userRepository.findUserById(payload.sub);
    if (!user) {
      throw new AppError(401, "Account not found");
    }
    if (user.isBanned) {
      throw new AppError(401, "Account disabled");
    }

    req.user = {
      sub: user.id,
      email: user.email,
      role: user.role as unknown as Role,
      warehouseId: user.warehouseId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
