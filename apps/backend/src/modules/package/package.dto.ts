import z from "zod";
import { PackageStatus } from "@mini-wms/shared-types";
import { paginationSchema } from "@/shared/dto/pagination.dto";

const sortFields = [
  "code",
  "price",
  "status",
  "createdAt",
  "updatedAt",
] as const;

const codeField = z
  .string({ error: "Code is required" })
  .min(1, "Code cannot be empty")
  .max(50, "Code must be at most 50 characters")
  .trim();

const priceField = z.coerce
  .number({ error: "Price must be a number" })
  .min(0, "Price must be >= 0")
  .multipleOf(0.01, "Price supports at most 2 decimal places");

const warehouseIdField = z
  .string({ error: "Warehouse ID is required" })
  .uuid("Invalid warehouse ID format");

const statusField = z.enum(
  [
    PackageStatus.PENDING,
    PackageStatus.IN_TRANSIT,
    PackageStatus.DELIVERED,
    PackageStatus.CANCELLED,
  ],
  { error: "Invalid status value" },
);

export const findPackageByIdSchema = z.object({
  params: z.object({
    id: z.string({ error: "Package ID is required" }).uuid("Invalid package ID"),
  }),
});

export const findPackagesByFilterSchema = z.object({
  query: paginationSchema.extend({
    warehouseId: z.string().uuid("Invalid warehouse ID filter").optional(),
    status: statusField.optional(),
    search: z.string().min(1, "Search term cannot be empty").optional(),
    sortBy: z.enum(sortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const updatePackageSchema = z.object({
  params: z.object({
    id: z.string({ error: "Package ID is required" }).uuid("Invalid package ID"),
  }),
  body: z
    .object({
      code: codeField.optional(),
      price: priceField.optional(),
      warehouseId: warehouseIdField.optional(),
      status: statusField.optional(),
      version: z
        .number({ error: "Version is required for update" })
        .int("Version must be an integer")
        .nonnegative("Version cannot be negative"),
    })
    .strict(),
});

export const createPackageSchema = z.object({
  body: z
    .object({
      code: codeField,
      price: priceField.default(0),
      warehouseId: warehouseIdField,
      status: statusField.default(PackageStatus.PENDING),
    })
    .strict(),
});

export const deletePackageSchema = z.object({
  params: z.object({
    id: z.string({ error: "Package ID is required" }).uuid("Invalid package ID"),
  }),
});

export type UpdatePackageDto = z.infer<typeof updatePackageSchema>["body"];
export type CreatePackageDto = z.infer<typeof createPackageSchema>["body"];
export type PackageFilter = z.infer<typeof findPackagesByFilterSchema>["query"];
