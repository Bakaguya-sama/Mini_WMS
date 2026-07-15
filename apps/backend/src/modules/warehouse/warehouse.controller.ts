import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { warehouseService } from "./warehouse.service";
import { success } from "@/shared/utils/responseFormatter";
import { WarehouseFilter } from "./warehouse.dto";

class WarehouseController {
  getWarehouses() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await warehouseService.findWarehousesByFilter(
        req.query as unknown as WarehouseFilter,
      );

      res.status(200).json(success(result));
    });
  }

  getWarehouseById() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await warehouseService.findWarehouseById(id, req.user);

      res.status(200).json(success(result));
    });
  }

  createWarehouse() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await warehouseService.createWarehouse(req.body);

      res.status(201).json(success(result));
    });
  }

  updateWarehouse() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await warehouseService.updateWarehouse(
        id,
        req.body,
        req.user,
      );

      res.status(200).json(success(result));
    });
  }

  deleteWarehouse() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      await warehouseService.deleteWarehouse(id, req.user);

      res.status(204).send();
    });
  }
}

export const warehouseController = new WarehouseController();
