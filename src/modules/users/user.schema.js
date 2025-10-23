/**
 * User Validation Schemas
 * Joi validation schemas for user-related requests
 * @module modules/users/user.schema
 */

const Joi = require('joi');

const userValidationSchemas = {
    /**
     * Login validation (for both Super Admin and Tenant users)
     */
    login: {
        body: Joi.object({
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'Email must be a valid email address',
                    'string.empty': 'Email is required'
                }),
            password: Joi.string().min(6).required()
                .messages({
                    'string.min': 'Password must be at least 6 characters long',
                    'string.empty': 'Password is required'
                })
        })
    },

    /**
     * Create user validation
     */
    createUser: {
        body: Joi.object({
            name: Joi.string().min(2).max(255).required()
                .messages({
                    'string.empty': 'Name is required',
                    'string.min': 'Name must be at least 2 characters',
                    'string.max': 'Name cannot exceed 255 characters'
                }),
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'Email must be valid',
                    'string.empty': 'Email is required'
                }),
            password: Joi.string().min(8).required()
                .messages({
                    'string.empty': 'Password is required',
                    'string.min': 'Password must be at least 8 characters'
                }),
            role: Joi.string().valid('Admin', 'Sales', 'Viewer').required()
                .messages({
                    'any.only': 'Role must be one of: Admin, Sales, Viewer',
                    'string.empty': 'Role is required'
                })
        })
    },

    /**
     * Update user validation
     */
    updateUser: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.positive': 'User ID must be positive'
                })
        }),
        body: Joi.object({
            name: Joi.string().min(2).max(255).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(8).optional()
                .messages({
                    'string.min': 'Password must be at least 8 characters'
                }),
            role: Joi.string().valid('Admin', 'Sales', 'Viewer').optional()
                .messages({
                    'any.only': 'Role must be one of: Admin, Sales, Viewer'
                }),
            is_active: Joi.boolean().optional()
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    /**
     * Get user by ID validation
     */
    getUserById: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.positive': 'User ID must be positive'
                })
        })
    },

    /**
     * Delete user validation
     */
    deleteUser: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.positive': 'User ID must be positive'
                })
        })
    }
};

module.exports = userValidationSchemas;