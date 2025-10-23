/**
 * Project Routes
 * @module modules/projects/project.routes
 */

const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const validate = require('../../middleware/validate');
const projectSchemas = require('./project.schema');
const { authenticateToken } = require('../../middleware/auth');
const { tenantResolver } = require('../../middleware/tenantResolver');
const { checkPermission, requireAdmin } = require('../../middleware/rbac');
const { RESOURCES, ACTIONS } = require('../../config/roles');
const { auditLog } = require('../../middleware/auditLogger');

// All project routes require authentication and tenant context
router.use(authenticateToken);
router.use(tenantResolver);

/**
 * @swagger
 * /v1/projects:
 *   post:
 *     summary: Create New Project
 *     description: Create a new real estate project within the tenant's schema (Admin only)
 *     tags: [Projects]
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
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Green Valley Residences"
 *               location:
 *                 type: string
 *                 example: "Sector 42, Gurgaon, Haryana"
 *               description:
 *                 type: string
 *                 example: "Premium 3BHK and 4BHK apartments with modern amenities"
 *               total_units:
 *                 type: integer
 *                 example: 150
 *               status:
 *                 type: string
 *                 enum: [Planning, Under Construction, Completed, On Hold]
 *                 example: "Under Construction"
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *                   example: Project created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "a3bb189e-8bf9-3888-9912-ace4e6543002"
 *                     name:
 *                       type: string
 *                       example: "Green Valley Residences"
 *                     location:
 *                       type: string
 *                       example: "Sector 42, Gurgaon, Haryana"
 *                     description:
 *                       type: string
 *                       example: "Premium 3BHK and 4BHK apartments with modern amenities"
 *                     total_units:
 *                       type: integer
 *                       example: 150
 *                     status:
 *                       type: string
 *                       example: "Under Construction"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
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
    validate(projectSchemas.createProject),
    checkPermission(RESOURCES.PROJECTS, ACTIONS.CREATE),
    projectController.createProject,
    auditLog('project', 'CREATE')
);

/**
 * @swagger
 * /v1/projects:
 *   get:
 *     summary: Get All Projects
 *     description: Retrieve all projects within the tenant with pagination and optional filtering
 *     tags: [Projects]
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
 *         description: Number of projects per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planning, Under Construction, Completed, On Hold]
 *         description: Filter by project status
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                   example: Projects retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           location:
 *                             type: string
 *                           status:
 *                             type: string
 *                           total_units:
 *                             type: integer
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
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/',
    checkPermission(RESOURCES.PROJECTS, ACTIONS.READ),
    projectController.getAllProjects
);

/**
 * @swagger
 * /v1/projects/{id}:
 *   get:
 *     summary: Get Project by ID
 *     description: Retrieve a single project's details by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
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
 *                   example: Project retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                     description:
 *                       type: string
 *                     total_units:
 *                       type: integer
 *                     status:
 *                       type: string
 *       404:
 *         description: Project not found
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
    validate(projectSchemas.getProject),
    checkPermission(RESOURCES.PROJECTS, ACTIONS.READ),
    projectController.getProjectById
);

/**
 * @swagger
 * /v1/projects/{id}:
 *   patch:
 *     summary: Update Project
 *     description: Update an existing project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Green Valley Residences Phase 2"
 *               location:
 *                 type: string
 *                 example: "Sector 42, Gurgaon, Haryana"
 *               description:
 *                 type: string
 *               total_units:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Planning, Under Construction, Completed, On Hold]
 *     responses:
 *       200:
 *         description: Project updated successfully
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
 *                   example: Project updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
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
    validate(projectSchemas.updateProject),
    checkPermission(RESOURCES.PROJECTS, ACTIONS.UPDATE),
    projectController.updateProject,
    auditLog('project', 'UPDATE')
);

/**
 * @swagger
 * /v1/projects/{id}:
 *   delete:
 *     summary: Delete Project
 *     description: Soft delete a project (Admin only). Project is marked as deleted but not removed from database.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *                   example: Project deleted successfully
 *       404:
 *         description: Project not found
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
    validate(projectSchemas.deleteProject),
    checkPermission(RESOURCES.PROJECTS, ACTIONS.DELETE),
    projectController.deleteProject,
    auditLog('project', 'DELETE')
);

module.exports = router;

