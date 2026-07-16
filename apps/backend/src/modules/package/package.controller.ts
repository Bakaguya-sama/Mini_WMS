import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { packageService } from "./package.service";
import { success } from "@/shared/utils/responseFormatter";
import { PackageFilter } from "./package.dto";

class PackageController {
  getPackages() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await packageService.findPackagesByFilter(
        req.query as unknown as PackageFilter,
        req.user,
      );

      res.status(200).json(success(result));
    });
  }

  getPackageById() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await packageService.findPackageById(id, req.user);

      res.status(200).json(success(result));
    });
  }

  createPackage() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await packageService.createPackage(req.body, req.user);

      res.status(201).json(success(result));
    });
  }

  updatePackage() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await packageService.updatePackage(id, req.body, req.user);

      res.status(200).json(success(result));
    });
  }

  deletePackage() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      await packageService.deletePackage(id, req.user);

      res.status(204).send();
    });
  }
}

export const packageController = new PackageController();
