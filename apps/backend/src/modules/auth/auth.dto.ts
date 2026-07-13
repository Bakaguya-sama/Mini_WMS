import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }).toLowerCase(),
    password: z
      .string({ error: "password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});
