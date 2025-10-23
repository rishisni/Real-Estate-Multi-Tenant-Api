/**
 * Tenant Validation Schemas
 * Joi validation schemas for tenant-related requests
 * @module modules/tenants/tenant.schema
 */

const Joi = require('joi');

const tenantValidationSchemas = {
    /**
     * Create tenant validation
     */
    createTenant: {
        body: Joi.object({
            name: Joi.string().trim().min(3).max(255).required()
                .messages({
                    'string.empty': 'Tenant name is required',
                    'string.min': 'Tenant name must be at least 3 characters',
                    'string.max': 'Tenant name cannot exceed 255 characters'
                }),
            contact: Joi.string().email().required()
                .messages({
                    'string.empty': 'Contact email is required',
                    'string.email': 'Contact must be a valid email'
                }),
            subscription_type: Joi.string().valid('Basic', 'Premium').required()
                .messages({
                    'any.only': 'Subscription type must be either Basic or Premium'
                }),
            // Initial Admin user details
            adminName: Joi.string().min(3).max(255).required()
                .messages({
                    'string.empty': 'Admin name is required',
                    'string.min': 'Admin name must be at least 3 characters'
                }),
            adminEmail: Joi.string().email().required()
                .messages({
                    'string.empty': 'Admin email is required',
                    'string.email': 'Admin email must be valid'
                }),
            adminPassword: Joi.string().min(8).required()
                .messages({
                    'string.empty': 'Admin password is required',
                    'string.min': 'Admin password must be at least 8 characters'
                })
        })
    },

    /**
     * Update tenant validation
     */
    updateTenant: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Tenant ID must be a number',
                    'number.positive': 'Tenant ID must be positive'
                })
        }),
        body: Joi.object({
            name: Joi.string().trim().min(3).max(255).optional(),
            contact: Joi.string().email().optional(),
            subscription_type: Joi.string().valid('Basic', 'Premium').optional()
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    /**
     * Get tenant by ID validation
     */
    getTenant: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Tenant ID must be a number',
                    'number.positive': 'Tenant ID must be positive'
                })
        })
    },

    /**
     * Tenant ID param validation (for activate/deactivate)
     */
    tenantIdParam: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Tenant ID must be a number',
                    'number.positive': 'Tenant ID must be positive'
                })
        })
    }
};

module.exports = tenantValidationSchemas;