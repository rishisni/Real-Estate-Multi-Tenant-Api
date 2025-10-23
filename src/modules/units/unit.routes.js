/**
 * Unit Routes
 * @module modules/units/unit.routes
 */

const express = require('express');
const router = express.Router();
const unitController = require('./unit.controller');
const validate = require('../../middleware/validate');
const unitSchemas = require('./unit.schema');
const { authenticateToken } = require('../../middleware/auth');
const { tenantResolver } = require('../../middleware/tenantResolver');
const { checkPermission, requireAdmin } = require('../../middleware/rbac');
const { RESOURCES, ACTIONS } = require('../../config/roles');
const { auditLog } = require('../../middleware/auditLogger');

// All unit routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantResolver);

/**
 * @swagger
 * /v1/units:
 *   post:
 *     summary: Create New Unit
 *     description: Create a new real estate unit within a project (Admin only)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - unit_number
 *               - area
 *               - price
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *                 example: "a3bb189e-8bf9-3888-9912-ace4e6543002"
 *               unit_number:
 *                 type: string
 *                 example: "A-101"
 *               floor:
 *                 type: integer
 *                 example: 1
 *               area:
 *                 type: number
 *                 example: 1250.5
 *                 description: Area in square feet
 *               bedrooms:
 *                 type: integer
 *                 example: 3
 *               bathrooms:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 4500000
 *               status:
 *                 type: string
 *                 enum: [Available, Booked, Sold]
 *                 default: Available
 *                 example: "Available"
 *     responses:
 *       201:
 *         description: Unit created successfully
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
 *                   example: Unit created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     project_id:
 *                       type: string
 *                       format: uuid
 *                     unit_number:
 *                       type: string
 *                     floor:
 *                       type: integer
 *                     area:
 *                       type: number
 *                     bedrooms:
 *                       type: integer
 *                     bathrooms:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/',
    requireAdmin,
    validate(unitSchemas.createUnit),
    checkPermission(RESOURCES.UNITS, ACTIONS.CREATE),
    unitController.createUnit,
    auditLog('unit', 'CREATE')
);

/**
 * @swagger
 * /v1/units:
 *   get:
 *     summary: Get All Units with Filters
 *     description: Retrieve all units with advanced filtering by status, project, price range, and bedrooms
 *     tags: [Units]
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
 *         description: Number of units per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Booked, Sold]
 *         description: Filter by unit status
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by project ID
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Filter by number of bedrooms
 *     responses:
 *       200:
 *         description: Units retrieved successfully
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
 *                   example: Units retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     units:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           project_id:
 *                             type: string
 *                             format: uuid
 *                           unit_number:
 *                             type: string
 *                           area:
 *                             type: number
 *                           price:
 *                             type: number
 *                           status:
 *                             type: string
 *                           bedrooms:
 *                             type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/',
    validate(unitSchemas.filterUnits),
    checkPermission(RESOURCES.UNITS, ACTIONS.READ),
    unitController.getAllUnits
);

/**
 * @swagger
 * /v1/units/{id}:
 *   get:
 *     summary: Get Unit by ID
 *     description: Retrieve detailed information about a specific unit
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit retrieved successfully
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
 *                   example: Unit retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     project_id:
 *                       type: string
 *                       format: uuid
 *                     unit_number:
 *                       type: string
 *                     floor:
 *                       type: integer
 *                     area:
 *                       type: number
 *                     bedrooms:
 *                       type: integer
 *                     bathrooms:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     status:
 *                       type: string
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/:id',
    validate(unitSchemas.getUnit),
    checkPermission(RESOURCES.UNITS, ACTIONS.READ),
    unitController.getUnitById
);

/**
 * @swagger
 * /v1/units/{id}:
 *   patch:
 *     summary: Update Unit
 *     description: Update details of an existing unit (Admin only)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unit_number:
 *                 type: string
 *               floor:
 *                 type: integer
 *               area:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Available, Booked, Sold]
 *     responses:
 *       200:
 *         description: Unit updated successfully
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
 *                   example: Unit updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
    '/:id',
    requireAdmin,
    validate(unitSchemas.updateUnit),
    checkPermission(RESOURCES.UNITS, ACTIONS.UPDATE),
    unitController.updateUnit,
    auditLog('unit', 'UPDATE')
);

/**
 * @swagger
 * /v1/units/{id}/book:
 *   post:
 *     summary: Book a Unit
 *     description: Change unit status from Available to Booked (Admin and Sales users with book permission)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID to book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: "Rajesh Kumar"
 *               customer_email:
 *                 type: string
 *                 format: email
 *                 example: "rajesh.kumar@example.com"
 *               customer_phone:
 *                 type: string
 *                 example: "+91-9876543210"
 *     responses:
 *       200:
 *         description: Unit booked successfully
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
 *                   example: Unit booked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     unit_number:
 *                       type: string
 *                       example: "A-101"
 *                     status:
 *                       type: string
 *                       example: "Booked"
 *                     booked_by:
 *                       type: string
 *                       example: "John Smith"
 *                     booked_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or unit already booked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Unit not found
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
router.post(
    '/:id/book',
    validate(unitSchemas.bookUnit),
    checkPermission(RESOURCES.UNITS, ACTIONS.BOOK),
    unitController.bookUnit,
    auditLog('unit', 'BOOK')
);

/**
 * @swagger
 * /v1/units/{id}:
 *   delete:
 *     summary: Delete Unit
 *     description: Soft delete a unit (Admin only). Unit is marked as deleted but not removed from database.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *     responses:
 *       200:
 *         description: Unit deleted successfully
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
 *                   example: Unit deleted successfully
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
    '/:id',
    requireAdmin,
    validate(unitSchemas.deleteUnit),
    checkPermission(RESOURCES.UNITS, ACTIONS.DELETE),
    unitController.deleteUnit,
    auditLog('unit', 'DELETE')
);

module.exports = router;

