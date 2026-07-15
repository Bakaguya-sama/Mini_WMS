import { z } from "zod";
import { paginationSchema } from "@/shared/dto/pagination.dto";

const nameField = z
  .string({ error: "name is required" })
  .min(3, "name must be at least 3 characters")
  .max(100, "name must be at most 100 characters")
  .trim();

export const findWarehouseByIdSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const deleteWarehouseSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
});

export const findWarehousesByFilterSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().min(1).optional(),
  }),
});

export const createWarehouseSchema = z.object({
  body: z.object({
    name: nameField,
  }),
});

export const updateWarehouseSchema = z.object({
  params: z.object({ id: z.uuidv4() }),
  body: z
    .object({
      name: nameField.optional(),
    })
    .strict(),
});

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>["body"];
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>["body"];
export type WarehouseFilter = z.infer<
  typeof findWarehousesByFilterSchema
>["query"];
