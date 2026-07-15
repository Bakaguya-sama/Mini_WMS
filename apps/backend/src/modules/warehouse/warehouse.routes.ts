import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/authenticate.middleware";
import {
  adminOnly,
  anyUser,
  authorize,
} from "@/middlewares/authorize.middleware";
import { Role } from "@mini-wms/shared-types";
import { warehouseController } from "./warehouse.controller";
import {
  findWarehouseByIdSchema,
  findWarehousesByFilterSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  deleteWarehouseSchema,
} from "./warehouse.dto";

const router = Router();

// All warehouse routes require authentication
router.use(authenticate);

/**
 * @openapi
 * components:
 *   schemas:
 *     WarehouseResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Main Warehouse"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     WarehouseListResponse:
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
 *                 $ref: '#/components/schemas/WarehouseResponse'
 *             total:
 *               type: integer
 *               example: 10
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *
 *     CreateWarehouseInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "New Warehouse"
 *
 *     UpdateWarehouseInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "Updated Warehouse"
 */

/**
 * @openapi
 * /warehouses:
 *   get:
 *     summary: Get warehouses list
 *     description: Retrieve a paginated list of warehouses. Accessible by ADMIN only.
 *     tags: [Warehouses]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by warehouse name
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseListResponse'
 *       401:
 *         description: Unauthorized – missing or invalid token
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
 */
router.get(
  "/",
  adminOnly,
  validate(findWarehousesByFilterSchema),
  warehouseController.getWarehouses(),
);

/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     description: Retrieve a single warehouse by its UUID. Accessible by ADMIN, MANAGER, and STAFF.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Warehouse UUID
 *     responses:
 *       200:
 *         description: Warehouse retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WarehouseResponse'
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
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:id",
  anyUser,
  validate(findWarehouseByIdSchema),
  warehouseController.getWarehouseById(),
);

/**
 * @openapi
 * /warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     description: Create a new warehouse. Accessible by ADMIN only.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWarehouseInput'
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WarehouseResponse'
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
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Warehouse name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  adminOnly,
  validate(createWarehouseSchema),
  warehouseController.createWarehouse(),
);

/**
 * @openapi
 * /warehouses/{id}:
 *   patch:
 *     summary: Update a warehouse
 *     description: Update warehouse details. ADMIN can update any warehouse. MANAGER can only update their own warehouse.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Warehouse UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWarehouseInput'
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WarehouseResponse'
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
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Warehouse name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id",
  adminOnly,
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse(),
);

/**
 * @openapi
 * /warehouses/{id}:
 *   delete:
 *     summary: Delete a warehouse
 *     description: Soft-delete a warehouse (sets deletedAt). Accessible by ADMIN only.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Warehouse UUID
 *     responses:
 *       204:
 *         description: Warehouse deleted successfully (no content)
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
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  adminOnly,
  validate(deleteWarehouseSchema),
  warehouseController.deleteWarehouse(),
);

export default router;
