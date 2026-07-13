import { SignOptions } from "jsonwebtoken";
import { env } from "./env.config";

export const jwtConfig = {
  access: {
    secret: env.JWT_SECRET,
    options: {
      expiresIn: "15m",
    } satisfies SignOptions,
  },
  refresh: {
    secret: env.JWT_SECRET,
    options: {
      expiresIn: "7d",
    } satisfies SignOptions,
  },
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
