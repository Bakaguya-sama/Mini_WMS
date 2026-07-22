import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema } from "./auth.dto";
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
 *             user:
 *               $ref: '#/components/schemas/AuthUser'
 *
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIs..."
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: >
 *       Authenticate with email and password. Returns a JWT access token
 *       (expires in 15 minutes) in the response body. A refresh token
 *       (expires in 7 days, single-use rotation) is set as an HttpOnly,
 *       Secure, SameSite=None cookie named `refreshToken` — it is NEVER
 *       exposed in the response body and cannot be read via client-side
 *       JavaScript.
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
 *         description: Login successful. A `Set-Cookie` header with the refresh token is also sent.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGc...; Path=/api/v1/auth; HttpOnly; Secure; SameSite=None"
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
 *     description: >
 *       Exchanges the HttpOnly `refreshToken` cookie (sent automatically by
 *       the browser, requires `credentials: "include"` on the client) for a
 *       new access token. Uses single-use rotation — the server issues a new
 *       refresh token cookie and immediately invalidates the previous one.
 *       No request body is required; the refresh token is NEVER read from
 *       or written to the request/response body.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully. A new `Set-Cookie` header replaces the previous refresh token.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGc...; Path=/api/v1/auth; HttpOnly; Secure; SameSite=None"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       401:
 *         description: Missing, invalid, expired, or already-used (revoked) refresh token cookie
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
router.post("/refresh", authController.refresh());

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: >
 *       Revokes the current refresh token server-side and clears the
 *       `refreshToken` cookie via `Set-Cookie` with an expired date.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logged out successfully. The `refreshToken` cookie is cleared.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "refreshToken=; Path=/api/v1/auth; HttpOnly; Secure; SameSite=None; Max-Age=0"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authenticate, authController.logout());

export default router;
