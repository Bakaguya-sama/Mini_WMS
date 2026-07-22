import { SignOptions } from "jsonwebtoken";
import { CookieOptions } from "express";
import { env } from "./env.config";

export const jwtConfig = {
  access: {
    secret: env.JWT_ACCESS_SECRET,
    options: {
      expiresIn: "15m",
    } satisfies SignOptions,
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    options: {
      expiresIn: "7d",
    } satisfies SignOptions,
  },
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  } satisfies CookieOptions,
};
