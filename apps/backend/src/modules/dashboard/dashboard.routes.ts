import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/authenticate.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { Role } from "@mini-wms/shared-types";
import { dashboardController } from "./dashboard.controller";
import { getTotalOfPackagesByFilterSchema } from "../package/package.dto";

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @openapi
 * components:
 *   schemas:
 *     FinancialReportResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             warehouseId:
 *               type: string
 *               format: uuid
 *               example: WAREHOUSE_ID
 *             totalPackages:
 *               type: number
 *               format: integer
 *               example: 150
 *             totalRevenue:
 *               type: number
 *               format: float
 *               example: 15400.50
 */

/**
 * @openapi
 * /dashboard/financial-report:
 *   get:
 *     summary: Get financial report
 *     description: >
 *       Retrieve a financial report based on packages.
 *       ADMIN sees the report across all warehouses (or can filter by warehouseId).
 *       MANAGER is restricted to seeing the report for their own warehouse.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by warehouse (ADMIN only)
 *     responses:
 *       200:
 *         description: Financial report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialReportResponse'
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
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/financial-report",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(getTotalOfPackagesByFilterSchema),
  dashboardController.getFinancialReport(),
);

export default router;
