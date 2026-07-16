import type { AuthenticatedUser } from "./jwt.types.js";

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

export {};
