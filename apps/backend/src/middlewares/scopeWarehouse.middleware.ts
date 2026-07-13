import { Request, Response, NextFunction } from "express";
import { Role } from "@mini-wms/shared-types";
import { AppError } from "@/shared/errors/AppError";

export const scopeWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user!.role === Role.ADMIN) return next();

  const requestedWarehouse =
    req.body.warehouseId ?? req.params.warehouseId ?? req.query.warehouseId;

  if (requestedWarehouse && requestedWarehouse !== req.user!.warehouseId) {
    return next(
      new AppError(403, "Cannot access resources outside your warehouse"),
    );
  }

  next();
};
