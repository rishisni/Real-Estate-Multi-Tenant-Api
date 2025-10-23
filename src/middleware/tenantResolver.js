/**
 * Tenant Resolver Middleware
 * Determines the correct database schema based on the authenticated user
 * Sets the PostgreSQL search_path to isolate tenant data
 * @module middleware/tenantResolver
 */

const { sequelize } = require('../config/db');
const { ForbiddenError, UnauthorizedError } = require('../utils/errors');
const { sendError } = require('../utils/response');

/**
 * Middleware to resolve and set the appropriate tenant schema
 * Must be used after authenticateToken middleware (requires req.user)
 * 
 * Behavior:
 * - Super Admin: Sets search_path to 'public'
 * - Tenant Users: Sets search_path to their tenant's schema
 * - Validates tenant is active before allowing access
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const tenantResolver = async (req, res, next) => {
    try {
        const role = req.user?.role;
        const tenantId = req.user?.tenant_id;
        const tenantSchema = req.user?.tenant_schema;

        // Super Admin operates in public schema
        if (role === 'Super Admin') {
            await sequelize.query('SET search_path TO public;');
            req.tenantSchema = 'public';
            return next();
        }

        // Regular tenant users must have tenant information
        if (!tenantId || !tenantSchema) {
            throw new UnauthorizedError('Tenant information missing in authentication token');
        }

        // Verify tenant exists and is active
        const tenants = await sequelize.query(
            'SELECT id, is_active, schema_name FROM public.tenants WHERE id = :tenantId',
            {
                replacements: { tenantId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Check if tenant exists (array should have one result)
        if (!tenants || tenants.length === 0) {
            throw new ForbiddenError('Tenant not found');
        }

        const tenant = tenants[0];
        if (!tenant.is_active) {
            throw new ForbiddenError('Tenant account is deactivated. Please contact support.');
        }

        // Set search path to tenant's schema
        await sequelize.query(`SET search_path TO "${tenantSchema}", public;`);
        req.tenantSchema = tenantSchema;
        req.tenantId = tenantId;

        next();

    } catch (error) {
        if (error instanceof ForbiddenError) {
            return sendError(res, error, 403);
        } else if (error instanceof UnauthorizedError) {
            return sendError(res, error, 401);
        } else {
            console.error('Tenant resolution error:', error);
            return sendError(res, new Error('Failed to resolve tenant context'), 500);
        }
    }
};

/**
 * Middleware to ensure the search path is set to public schema
 * Used for routes that should only operate on public schema (Super Admin routes)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const usePublicSchema = async (req, res, next) => {
    try {
        await sequelize.query('SET search_path TO public;');
        req.tenantSchema = 'public';
        next();
    } catch (error) {
        console.error('Failed to set public schema:', error);
        return sendError(res, new Error('Failed to set database context'), 500);
    }
};

module.exports = {
    tenantResolver,
    usePublicSchema
};