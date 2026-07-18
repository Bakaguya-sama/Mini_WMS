import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, refreshSchema } from "./auth.dto";
import { authenticate } from "@/middlewares/authenticate.middleware";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@miniwms.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "admin123"
 *
 *     AuthUser:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         email: { type: string }
 *         username: { type: string }
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF]
 *         warehouseId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIs..."
 *             refreshToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIs..."
 *             user:
 *               $ref: '#/components/schemas/AuthUser'
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate with email and password, then return a JWT access token that expires in 15 minutes.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid input data (invalid email format, password too short)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: The account has been banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validate(loginSchema), authController.login());

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access/refresh token pair (rotation).
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *       401:
 *         description: Invalid, expired, or revoked refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", validate(refreshSchema), authController.refresh());

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Revoke the current refresh token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authenticate, authController.logout());

export default router;
