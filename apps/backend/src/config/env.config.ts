import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
}).transform((data) => ({
  ...data,
  CORS_ORIGIN: data.CORS_ORIGIN ?? (data.NODE_ENV === "production" ? undefined : "http://localhost:5173"),
}));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

if (env.NODE_ENV === "production" && !env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN is required in production");
}

export {
  env
};