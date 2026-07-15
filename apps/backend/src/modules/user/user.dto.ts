import { z } from "zod";
import { Role } from "@mini-wms/shared-types";
import { paginationSchema } from "@/shared/dto/pagination.dto";

const emailField = z.email({ error: "Invalid email format" }).toLowerCase();
const usernameField = z
  .string({ error: "username is required" })
  .min(3, "username must be at least 3 characters")
  .max(50)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, underscore",
  );
const passwordField = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters");

export const findUserByIdSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const banUserByIdSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const unbanUserByIdSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const deleteUserSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const findUsersByFilterSchema = z.object({
  query: paginationSchema.extend({
    warehouseId: z.uuidv4().optional(),
    role: z.enum(Role).optional(),
    isBanned: z.coerce.boolean().optional(),
    search: z.string().min(1).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z
    .object({
      email: emailField,
      username: usernameField,
      password: passwordField,
      role: z.enum(Role),
      warehouseId: z.uuidv4().optional(),
    })
    .refine(
      (data) => {
        const hasWarehouse = data.warehouseId !== undefined;
        return data.role === Role.ADMIN ? !hasWarehouse : hasWarehouse;
      },
      {
        error: "Manager/staff must have a warehouseid, except for Admin",
        path: ["warehouseId"],
      },
    ),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
  body: z.object({
    email: emailField.optional(),
    username: usernameField.optional(),
    password: passwordField.optional(),
    role: z.enum(Role).optional(),
    warehouseId: z.uuidv4().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      email: emailField.optional(),
      username: usernameField.optional(),
      password: passwordField.optional(),
    })
    .strict(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>["body"];
export type UpdateUserDto = z.infer<typeof updateUserSchema>["body"];
export type UpdateProfileDto = z.infer<typeof updateUserSchema>["body"];
export type UserFilter = z.infer<typeof findUsersByFilterSchema>["query"];
