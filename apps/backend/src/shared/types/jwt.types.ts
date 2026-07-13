import { Request } from "express";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: "admin" | "manager" | "staff";
}

export interface RefreshTokenPayload {
  sub: string;
}

export interface AuthRequest extends Request {
  user?: AccessTokenPayload;
}
