import { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError";
import { Role } from "@mini-wms/shared-types";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "Insufficient role"));
    }

    next();
  };
};

export const adminOnly = authorize(Role.ADMIN);
export const managerOnly = authorize(Role.MANAGER);
export const staffOnly = authorize(Role.STAFF);
export const anyUser = authorize(Role.ADMIN, Role.MANAGER, Role.STAFF);
