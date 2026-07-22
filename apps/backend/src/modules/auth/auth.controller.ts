import { asyncHandler } from "@/shared/utils/asyncHandler";
import { Request, Response } from "express";
import { authenticationService } from "./auth.service";
import { success } from "@/shared/utils/responseFormatter";
import { jwtConfig } from "@/config/jwt.config";

class AuthController {
  login() {
    return asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const { refreshToken, ...rest } = await authenticationService.login(
        email,
        password,
      );

      res.cookie("refreshToken", refreshToken, jwtConfig.cookie);
      res.status(200).json(success(rest));
    });
  }

  refresh() {
    return asyncHandler(async (req: Request, res: Response) => {
      const incomingRefreshToken = req.cookies.refreshToken;
      const { refreshToken, ...rest } =
        await authenticationService.refresh(incomingRefreshToken);

      res.cookie("refreshToken", refreshToken, jwtConfig.cookie);
      res.status(200).json(success(rest));
    });
  }

  logout() {
    return asyncHandler(async (req: Request, res: Response) => {
      await authenticationService.logout(req.user.sub);
      res.clearCookie("refreshToken", {
        path: jwtConfig.cookie.path,
        sameSite: jwtConfig.cookie.sameSite,
        secure: jwtConfig.cookie.secure,
      });
      res.status(204).send();
    });
  }
}

export const authController = new AuthController();
