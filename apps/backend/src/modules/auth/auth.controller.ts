import { asyncHandler } from "@/shared/utils/asyncHandler";
import { Request, Response } from "express";
import { authenticationService } from "./auth.service";
import { success } from "@/shared/utils/responseFormatter";

class AuthController {
  login() {
    return asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const result = await authenticationService.login(email, password);

      res.status(200).json(success(result));
    });
  }

  refresh() {
    return asyncHandler(async (req: Request, res: Response) => {
      const { refreshToken } = req.body;
      const result = await authenticationService.refresh(refreshToken);
      res.status(200).json(success(result));
    });
  }

  logout() {
    return asyncHandler(async (req: Request, res: Response) => {
      await authenticationService.logout(req.user.sub);
      res.status(204).send();
    });
  }
}

export const authController = new AuthController();
