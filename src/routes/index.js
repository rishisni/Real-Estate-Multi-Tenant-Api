/**
 * Main Routes Index
 * Aggregates all API routes
 * @module routes/index
 */

const express = require('express');
const router = express.Router();

// Import module routes
const tenantRoutes = require('../modules/tenants/tenant.routes');
const userRoutes = require('../modules/users/user.routes');
const projectRoutes = require('../modules/projects/project.routes');
const unitRoutes = require('../modules/units/unit.routes');
const auditLogRoutes = require('../modules/auditLogs/auditLog.routes');

// Super Admin routes
const superAdminStatsController = require('../controllers/superAdminStats.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/rbac');
const { usePublicSchema } = require('../middleware/tenantResolver');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Housingram API is running',
        timestamp: new Date().toISOString()
    });
});

// API version 1 routes
const v1Router = express.Router();

// Authentication and user management routes (includes auth routes)
v1Router.use('/', userRoutes);

// Super Admin routes
v1Router.use('/super-admin/tenants', tenantRoutes);
v1Router.get(
    '/super-admin/stats',
    authenticateToken,
    requireSuperAdmin,
    usePublicSchema,
    superAdminStatsController.getStats
);

// Tenant-scoped routes
v1Router.use('/projects', projectRoutes);
v1Router.use('/units', unitRoutes);
v1Router.use('/audit-logs', auditLogRoutes);

// Mount v1 router
router.use('/v1', v1Router);

// 404 handler for unmatched routes
router.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl
    });
});

module.exports = router;
