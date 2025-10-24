/**
 * User Routes
 * Handles authentication and user management routes
 * @module modules/users/user.routes
 */

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const validate = require('../../middleware/validate');
const userSchemas = require('./user.schema');
const { authenticateToken } = require('../../middleware/auth');
const { tenantResolver } = require('../../middleware/tenantResolver');
const { checkPermission, requireAdmin } = require('../../middleware/rbac');
const { RESOURCES, ACTIONS } = require('../../config/roles');
const { auditLog, captureOldValues } = require('../../middleware/auditLogger');

// ============================================
// AUTHENTICATION ROUTES (No auth required)
// ============================================

/**
 * @swagger
 * /v1/auth/super-admin/login:
 *   post:
 *     summary: Super Admin Login
 *     description: |
 *       Authenticate as a Super Admin to manage tenants.
 *       
 *       **Default SuperAdmin Credentials:**
 *       - Email: `superadmin@housingram.com`
 *       - Password: `SuperAdmin@123`
 *       
 *       After successful login, copy the returned token and use the "Authorize" button at the top to authenticate subsequent requests.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 default: superadmin@housingram.com
 *                 example: superadmin@housingram.com
 *               password:
 *                 type: string
 *                 format: password
 *                 default: SuperAdmin@123
 *                 example: SuperAdmin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/auth/super-admin/login',
    validate(userSchemas.login),
    userController.superAdminLogin
);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Tenant User Login
 *     description: |
 *       Authenticate as a tenant user (Admin, Sales, or Viewer).
 *       
 *       **Note:** You need to create a tenant first using Super Admin credentials, which will provide you with tenant admin credentials.
 *       
 *       After successful login, copy the returned token and use the "Authorize" button at the top to authenticate subsequent requests.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@acmebuilders.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: AdminPass@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials or tenant inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/auth/login',
    validate(userSchemas.login),
    userController.tenantUserLogin
);

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Refresh Authentication Token
 *     description: Generate a new JWT token using existing valid token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/auth/refresh',
    authenticateToken,
    userController.refreshToken
);

// ============================================
// USER MANAGEMENT ROUTES (Tenant-scoped, Auth required)
// ============================================

// Apply authentication and tenant resolver for all user management routes
router.use('/users', authenticateToken);
router.use('/users', tenantResolver);

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create New User
 *     description: Create a new user within the tenant (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Priya Desai"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "priya.desai@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *               role:
 *                 type: string
 *                 enum: [Admin, Sales, Viewer]
 *                 example: "Sales"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post(
    '/users',
    requireAdmin,
    validate(userSchemas.createUser),
    checkPermission(RESOURCES.USERS, ACTIONS.CREATE),
    userController.createUser,
    auditLog('user', 'CREATE')
);

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve all users within the authenticated user's tenant (supports pagination)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/users',
    checkPermission(RESOURCES.USERS, ACTIONS.READ),
    userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin, Sales, Viewer
 */
router.get(
    '/users/:id',
    validate(userSchemas.getUserById),
    checkPermission(RESOURCES.USERS, ACTIONS.READ),
    userController.getUserById
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.patch(
    '/users/:id',
    requireAdmin,
    validate(userSchemas.updateUser),
    checkPermission(RESOURCES.USERS, ACTIONS.UPDATE),
    userController.updateUser,
    auditLog('user', 'UPDATE')
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin only
 */
router.delete(
    '/users/:id',
    requireAdmin,
    validate(userSchemas.deleteUser),
    checkPermission(RESOURCES.USERS, ACTIONS.DELETE),
    userController.deleteUser,
    auditLog('user', 'DELETE')
);

module.exports = router;