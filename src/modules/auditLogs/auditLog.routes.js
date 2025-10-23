/**
 * Audit Log Routes
 * @module modules/auditLogs/auditLog.routes
 */

const express = require('express');
const router = express.Router();
const auditLogController = require('./auditLog.controller');
const { authenticateToken } = require('../../middleware/auth');
const { tenantResolver } = require('../../middleware/tenantResolver');
const { checkPermission } = require('../../middleware/rbac');
const { RESOURCES, ACTIONS } = require('../../config/roles');

// All audit log routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantResolver);

/**
 * @swagger
 * /v1/audit-logs:
 *   get:
 *     summary: Get Audit Logs
 *     description: Retrieve audit logs with optional filtering by user, action, entity, and date range (Admin only)
 *     tags: [Audit Logs]
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
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, BOOK]
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           enum: [project, unit, user]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    '/',
    checkPermission(RESOURCES.AUDIT_LOGS, ACTIONS.READ),
    auditLogController.getAllLogs
);

/**
 * @route   GET /api/v1/audit-logs/:id
 * @desc    Get audit log by ID
 * @access  Admin only
 */
router.get(
    '/:id',
    checkPermission(RESOURCES.AUDIT_LOGS, ACTIONS.READ),
    auditLogController.getLogById
);

module.exports = router;

