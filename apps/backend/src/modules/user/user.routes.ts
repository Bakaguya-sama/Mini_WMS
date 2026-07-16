import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/authenticate.middleware";
import { adminOnly, authorize } from "@/middlewares/authorize.middleware";
import { Role } from "@mini-wms/shared-types";
import { userController } from "./user.controller";
import {
  findUserByIdSchema,
  findUsersByFilterSchema,
  createUserSchema,
  updateUserSchema,
  banUserByIdSchema,
  unbanUserByIdSchema,
  deleteUserSchema,
  updateProfileSchema,
} from "./user.dto";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF]
 *         warehouseId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *
 *     UserListResponse:
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
 *                 $ref: '#/components/schemas/UserResponse'
 *             total:
 *               type: integer
 *               example: 50
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *
 *     CreateUserInput:
 *       type: object
 *       required: [email, username, password, role]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "staff@miniwms.com"
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           example: "john_doe"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "secret123"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF]
 *           example: "STAFF"
 *         warehouseId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF]
 *         warehouseId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get users list
 *     description: Retrieve a paginated, filterable list of users. Accessible by ADMIN and MANAGER.
 *     tags: [Users]
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
 *         description: Search by username or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF]
 *         description: Filter by role
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by warehouse
 *       - in: query
 *         name: isBanned
 *         schema:
 *           type: boolean
 *         description: Filter by ban status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [username, email, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
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
  authorize(Role.ADMIN, Role.MANAGER),
  validate(findUsersByFilterSchema),
  userController.getUsers(),
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a single user by their UUID. Accessible by ADMIN and MANAGER.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(findUserByIdSchema),
  userController.getUserById(),
);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a user account. ADMIN can create any role. MANAGER can only create STAFF within their own warehouse.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: Insufficient role or MANAGER creating outside own warehouse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(createUserSchema),
  userController.createUser(),
);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update own profile
 *     description: Update own profile. Any authenticated user can update their email, username, or password. Cannot change role or warehouseId.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/profile",
  validate(updateProfileSchema),
  userController.updateProfile(),
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Update user details. ADMIN can update any user. MANAGER can only update users in their warehouse.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(updateUserSchema),
  userController.updateUser(),
);

/**
 * @openapi
 * /users/{id}/ban:
 *   patch:
 *     summary: Ban a user
 *     description: Ban a user account. ADMIN can ban any user. MANAGER can only ban users in their warehouse.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Cannot ban yourself
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Account is already banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/ban",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(banUserByIdSchema),
  userController.banUser(),
);

/**
 * @openapi
 * /users/{id}/unban:
 *   patch:
 *     summary: Unban a user
 *     description: Restore a banned user account. ADMIN can unban any user. MANAGER can only unban users in their warehouse.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Account is not banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/unban",
  authorize(Role.ADMIN, Role.MANAGER),
  validate(unbanUserByIdSchema),
  userController.unbanUser(),
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Soft-delete a user (sets deletedAt). Only ADMIN can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       204:
 *         description: User deleted successfully (no content)
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Cannot delete user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  adminOnly,
  validate(deleteUserSchema),
  userController.deleteUser(),
);

export default router;
