import { asyncHandler } from "@/shared/utils/asyncHandler";
import { Request, Response } from "express";
import { authenticationService } from "./auth.service";
import { success } from "@/shared/utils/responseFormatter";

class AuthenticationController {
  login() {
    return asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const result = await authenticationService.login(email, password);

      res.status(200).json(success(result));
    });
  }
}

export const authenticationController = new AuthenticationController();
