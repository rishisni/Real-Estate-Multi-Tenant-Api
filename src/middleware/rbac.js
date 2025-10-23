/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permission checks based on user roles and resource access
 * @module middleware/rbac
 */

const { hasPermission, isSuperAdmin, RESOURCES, ACTIONS } = require('../config/roles');
const { ForbiddenError, UnauthorizedError } = require('../utils/errors');
const { sendError } = require('../utils/response');

/**
 * Middleware to check if user has permission to perform an action on a resource
 * Must be used after authenticateToken middleware (requires req.user)
 * 
 * @param {string} resource - Resource being accessed (from RESOURCES enum)
 * @param {string} action - Action being performed (from ACTIONS enum)
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/projects', 
 *   authenticateToken, 
 *   checkPermission(RESOURCES.PROJECTS, ACTIONS.CREATE),
 *   projectController.create
 * );
 */
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user || !req.user.role) {
                throw new UnauthorizedError('Authentication required');
            }

            const { role } = req.user;

            // Check if user has the required permission
            if (!hasPermission(role, resource, action)) {
                throw new ForbiddenError(
                    `Insufficient permissions. Role '${role}' cannot perform '${action}' on '${resource}'`
                );
            }

            next();
        } catch (error) {
            if (error instanceof ForbiddenError) {
                return sendError(res, error, 403);
            } else if (error instanceof UnauthorizedError) {
                return sendError(res, error, 401);
            } else {
                return sendError(res, new ForbiddenError('Permission check failed'), 403);
            }
        }
    };
};

/**
 * Middleware to ensure only Super Admins can access a route
 * Must be used after authenticateToken middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * router.get('/super-admin/stats', authenticateToken, requireSuperAdmin, getStats);
 */
const requireSuperAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!isSuperAdmin(req.user.role)) {
            throw new ForbiddenError('Super Admin access required');
        }

        next();
    } catch (error) {
        if (error instanceof ForbiddenError) {
            return sendError(res, error, 403);
        } else if (error instanceof UnauthorizedError) {
            return sendError(res, error, 401);
        } else {
            return sendError(res, new ForbiddenError('Authorization failed'), 403);
        }
    }
};

/**
 * Middleware to ensure user is at least an Admin within their tenant
 * Must be used after authenticateToken middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * router.post('/users', authenticateToken, requireAdmin, userController.create);
 */
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            throw new UnauthorizedError('Authentication required');
        }

        const { role } = req.user;

        // Super Admin and Admin roles are allowed
        if (!isSuperAdmin(role) && role !== 'Admin') {
            throw new ForbiddenError('Admin access required');
        }

        next();
    } catch (error) {
        if (error instanceof ForbiddenError) {
            return sendError(res, error, 403);
        } else if (error instanceof UnauthorizedError) {
            return sendError(res, error, 401);
        } else {
            return sendError(res, new ForbiddenError('Authorization failed'), 403);
        }
    }
};

/**
 * Middleware to check if user can only access their own resource
 * Compares req.user.id with req.params.id
 * Admins and Super Admins bypass this check
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireOwnerOrAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            throw new UnauthorizedError('Authentication required');
        }

        const { role, id: userId } = req.user;
        const resourceUserId = parseInt(req.params.id);

        // Super Admins and Admins can access any resource
        if (isSuperAdmin(role) || role === 'Admin') {
            return next();
        }

        // Regular users can only access their own resources
        if (userId !== resourceUserId) {
            throw new ForbiddenError('You can only access your own resources');
        }

        next();
    } catch (error) {
        if (error instanceof ForbiddenError) {
            return sendError(res, error, 403);
        } else if (error instanceof UnauthorizedError) {
            return sendError(res, error, 401);
        } else {
            return sendError(res, new ForbiddenError('Authorization failed'), 403);
        }
    }
};

module.exports = {
    checkPermission,
    requireSuperAdmin,
    requireAdmin,
    requireOwnerOrAdmin
};

