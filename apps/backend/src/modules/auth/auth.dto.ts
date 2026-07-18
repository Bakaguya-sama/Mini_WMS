import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }).toLowerCase(),
    password: z
      .string({ error: "password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export type RefreshDto = z.infer<typeof refreshSchema>["body"];
