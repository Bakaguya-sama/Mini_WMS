import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/authenticate.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { Role } from "@mini-wms/shared-types";
import { packageController } from "./package.controller";
import {
  findPackageByIdSchema,
  findPackagesByFilterSchema,
  createPackageSchema,
  updatePackageSchema,
  deletePackageSchema,
} from "./package.dto";

const router = Router();

// All package routes require authentication
router.use(authenticate);

/**
 * @openapi
 * components:
 *   schemas:
 *     PackageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           example: "PKG-0001"
 *         price:
 *           type: number
 *           format: decimal
 *           example: 199.99
 *         warehouseId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [PENDING, IN_TRANSIT, DELIVERED, CANCELLED]
 *         version:
 *           type: integer
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PackageListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackageResponse'
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *
 *     CreatePackageInput:
 *       type: object
 *       required: [code, warehouseId]
 *       properties:
 *         code:
 *           type: string
 *           maxLength: 50
 *           example: "PKG-0001"
 *         price:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 199.99
 *         warehouseId:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         status:
 *           type: string
 *           enum: [PENDING, IN_TRANSIT, DELIVERED, CANCELLED]
 *           default: PENDING
 *
 *     UpdatePackageInput:
 *       type: object
 *       required: [version]
 *       properties:
 *         code:
 *           type: string
 *           maxLength: 50
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 299.99
 *         status:
 *           type: string
 *           enum: [PENDING, IN_TRANSIT, DELIVERED, CANCELLED]
 *         warehouseId:
 *           type: string
 *           format: uuid
 *         version:
 *           type: integer
 *           minimum: 0
 *           description: Optimistic lock version – must match current record version
 *           example: 0
 */

/**
 * @openapi
 * /packages:
 *   get:
 *     summary: Get packages list
 *     description: >
 *       Retrieve a paginated, filterable list of packages.
 *       ADMIN sees all packages. MANAGER and STAFF are scoped to their warehouse.
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by warehouse (ADMIN only)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_TRANSIT, DELIVERED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by package code
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [code, price, status, createdAt, updatedAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Packages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageListResponse'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/",
  authorize(Role.ADMIN, Role.MANAGER, Role.STAFF),
  validate(findPackagesByFilterSchema),
  packageController.getPackages(),
);

/**
 * @openapi
 * /packages/{id}:
 *   get:
 *     summary: Get package by ID
 *     description: Retrieve a single package by UUID. MANAGER and STAFF are scoped to their warehouse.
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Package UUID
 *     responses:
 *       200:
 *         description: Package retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PackageResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Package belongs to a different warehouse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.STAFF),
  validate(findPackageByIdSchema),
  packageController.getPackageById(),
);

/**
 * @openapi
 * /packages:
 *   post:
 *     summary: Create a package
 *     description: >
 *       Create a new package. ADMIN can create in any warehouse.
 *       MANAGER can only create in their own warehouse.
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePackageInput'
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PackageResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: MANAGER creating in a warehouse they do not manage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Package code already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(createPackageSchema),
  packageController.createPackage(),
);

/**
 * @openapi
 * /packages/{id}:
 *   patch:
 *     summary: Update a package
 *     description: >
 *       Update package fields (code, price, status, warehouseId).
 *       ADMIN can update any package. MANAGER can only update packages in their warehouse.
 *       STAFF can only update the status of packages in their warehouse.
 *       Uses optimistic locking – the `version` field must match the current record version to prevent concurrent update conflicts.
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Package UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePackageInput'
 *     responses:
 *       200:
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PackageResponse'
 *       400:
 *         description: Invalid input data or Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient role or STAFF/MANAGER trying to edit restricted fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Package/Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Version conflict – record was modified by another request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.STAFF),
  validate(updatePackageSchema),
  packageController.updatePackage(),
);

/**
 * @openapi
 * /packages/{id}:
 *   delete:
 *     summary: Delete a package
 *     description: Soft-delete a package (sets deletedAt). Only ADMIN and Manager can delete packages.
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Package UUID
 *     responses:
 *       204:
 *         description: Package deleted successfully (no content)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       409:
 *         description: Cannot delete delivered package
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(deletePackageSchema),
  packageController.deletePackage(),
);

export default router;
