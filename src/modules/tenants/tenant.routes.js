/**
 * Tenant Routes
 * Super Admin routes for tenant management
 * All routes require Super Admin authentication
 * @module modules/tenants/tenant.routes
 */

const express = require('express');
const router = express.Router();
const tenantController = require('./tenant.controller');
const validate = require('../../middleware/validate');
const tenantSchemas = require('./tenant.schema');
const { authenticateToken } = require('../../middleware/auth');
const { requireSuperAdmin } = require('../../middleware/rbac');
const { usePublicSchema } = require('../../middleware/tenantResolver');
const { RESOURCES, ACTIONS } = require('../../config/roles');
const { checkPermission } = require('../../middleware/rbac');

// All tenant management routes require Super Admin authentication
router.use(authenticateToken);
router.use(requireSuperAdmin);
router.use(usePublicSchema);

/**
 * @swagger
 * /v1/super-admin/tenants:
 *   post:
 *     summary: Create New Tenant
 *     description: Create a new tenant (builder) with dedicated schema and admin user (Super Admin only)
 *     tags: [Super Admin - Tenants]
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
 *               - contact_email
 *               - admin_name
 *               - admin_email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ABC Builders Pvt Ltd"
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: "contact@abcbuilders.com"
 *               contact_phone:
 *                 type: string
 *                 example: "+91-9876543210"
 *               subscription_type:
 *                 type: string
 *                 enum: [Basic, Standard, Premium]
 *                 default: Basic
 *               admin_name:
 *                 type: string
 *                 example: "Amit Sharma"
 *               admin_email:
 *                 type: string
 *                 format: email
 *                 example: "amit@abcbuilders.com"
 *               admin_password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *     responses:
 *       201:
 *         description: Tenant created successfully with schema and admin user
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.post(
    '/',
    validate(tenantSchemas.createTenant),
    checkPermission(RESOURCES.TENANTS, ACTIONS.CREATE),
    tenantController.createTenant
);

/**
 * @swagger
 * /v1/super-admin/tenants:
 *   get:
 *     summary: Get All Tenants
 *     description: Retrieve all tenants (builders) with pagination (Super Admin only)
 *     tags: [Super Admin - Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.get(
    '/',
    checkPermission(RESOURCES.TENANTS, ACTIONS.READ),
    tenantController.getAllTenants
);

/**
 * @route   GET /api/v1/super-admin/tenants/:id
 * @desc    Get tenant by ID
 * @access  Super Admin
 */
router.get(
    '/:id',
    validate(tenantSchemas.getTenant),
    checkPermission(RESOURCES.TENANTS, ACTIONS.READ),
    tenantController.getTenantById
);

/**
 * @route   PATCH /api/v1/super-admin/tenants/:id
 * @desc    Update tenant information
 * @access  Super Admin
 */
router.patch(
    '/:id',
    validate(tenantSchemas.updateTenant),
    checkPermission(RESOURCES.TENANTS, ACTIONS.UPDATE),
    tenantController.updateTenant
);

/**
 * @route   PATCH /api/v1/super-admin/tenants/:id/activate
 * @desc    Activate a tenant
 * @access  Super Admin
 */
router.patch(
    '/:id/activate',
    validate(tenantSchemas.tenantIdParam),
    checkPermission(RESOURCES.TENANTS, ACTIONS.ACTIVATE),
    tenantController.activateTenant
);

/**
 * @swagger
 * /v1/super-admin/tenants/{id}/deactivate:
 *   patch:
 *     summary: Deactivate Tenant
 *     description: Suspend/deactivate a tenant (Super Admin only)
 *     tags: [Super Admin - Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tenant deactivated successfully
 *       404:
 *         description: Tenant not found
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.patch(
    '/:id/deactivate',
    validate(tenantSchemas.tenantIdParam),
    checkPermission(RESOURCES.TENANTS, ACTIONS.DEACTIVATE),
    tenantController.deactivateTenant
);

module.exports = router;