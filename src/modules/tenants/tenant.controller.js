/**
 * Tenant Controller
 * Handles HTTP requests for tenant management
 * @module modules/tenants/tenant.controller
 */

const tenantService = require('./tenant.service');
const CreateTenantDto = require('./dto/create-tenant.dto');
const UpdateTenantDto = require('./dto/update-tenant.dto');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response');
const { NotFoundError, ConflictError } = require('../../utils/errors');

class TenantController {
    /**
     * Create a new tenant
     * POST /api/v1/super-admin/tenants
     */
    async createTenant(req, res) {
        try {
            const dto = new CreateTenantDto(req.body);
            const tenant = await tenantService.createTenant(dto);
            
            return sendCreated(res, tenant, 'Tenant created successfully with dedicated schema');
        } catch (error) {
            if (error instanceof ConflictError) {
                return sendError(res, error, 409);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Get all tenants (with pagination)
     * GET /api/v1/super-admin/tenants
     */
    async getAllTenants(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                activeOnly: req.query.activeOnly === 'true'
            };

            const result = await tenantService.getAllTenants(options);
            
            return sendSuccess(res, result, 'Tenants retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    /**
     * Get tenant by ID
     * GET /api/v1/super-admin/tenants/:id
     */
    async getTenantById(req, res) {
        try {
            const tenant = await tenantService.getTenantById(req.params.id);
            
            return sendSuccess(res, tenant, 'Tenant retrieved successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Update tenant
     * PATCH /api/v1/super-admin/tenants/:id
     */
    async updateTenant(req, res) {
        try {
            const dto = new UpdateTenantDto(req.body);
            const tenant = await tenantService.updateTenant(req.params.id, dto);
            
            return sendSuccess(res, tenant, 'Tenant updated successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Activate a tenant
     * PATCH /api/v1/super-admin/tenants/:id/activate
     */
    async activateTenant(req, res) {
        try {
            const tenant = await tenantService.activateTenant(req.params.id);
            
            return sendSuccess(res, tenant, 'Tenant activated successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Deactivate a tenant
     * PATCH /api/v1/super-admin/tenants/:id/deactivate
     */
    async deactivateTenant(req, res) {
        try {
            const tenant = await tenantService.deactivateTenant(req.params.id);
            
            return sendSuccess(res, tenant, 'Tenant deactivated successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Get tenant statistics
     * GET /api/v1/super-admin/stats
     */
    async getTenantStats(req, res) {
        try {
            const stats = await tenantService.getTenantStats();
            
            return sendSuccess(res, stats, 'Tenant statistics retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }
}

module.exports = new TenantController();