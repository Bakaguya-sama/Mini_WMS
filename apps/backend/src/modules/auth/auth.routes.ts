import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authenticationController } from "./auth.controller";
import { loginSchema } from "./auth.dto";

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
 *         description: The account has been locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validate(loginSchema), authenticationController.login);

export default router;
