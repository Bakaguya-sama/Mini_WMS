import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { userService } from "./user.service";
import { success } from "@/shared/utils/responseFormatter";
import { UserFilter } from "./user.dto";

class UserController {
  getUsers() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await userService.getUsersByFilter(
        req.query as unknown as UserFilter,
        req.user,
      );

      res.status(200).json(success(result));
    });
  }

  getUserById() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await userService.findUserById(id, req.user);

      res.status(200).json(success(result));
    });
  }

  createUser() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await userService.createUser(req.body, req.user);

      res.status(201).json(success(result));
    });
  }

  updateUser() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await userService.updateUser(id, req.body, req.user);

      res.status(200).json(success(result));
    });
  }

  getProfile() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await userService.getProfile(req.user);

      res.status(200).json(success(result));
    });
  }

  updateProfile() {
    return asyncHandler(async (req: Request, res: Response) => {
      const result = await userService.updateProfile(req.body, req.user);

      res.status(200).json(success(result));
    });
  }

  banUser() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await userService.banUser(id, req.user);

      res.status(200).json(success(result));
    });
  }

  unbanUser() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const result = await userService.unbanUser(id, req.user);

      res.status(200).json(success(result));
    });
  }

  deleteUser() {
    return asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      await userService.deleteUser(id, req.user);

      res.status(204).send();
    });
  }
}

export const userController = new UserController();
