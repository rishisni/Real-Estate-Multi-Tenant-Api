/**
 * Project Validation Schemas
 * @module modules/projects/project.schema
 */

const Joi = require('joi');

const projectValidationSchemas = {
    createProject: {
        body: Joi.object({
            name: Joi.string().min(3).max(255).required()
                .messages({
                    'string.empty': 'Project name is required',
                    'string.min': 'Project name must be at least 3 characters'
                }),
            location: Joi.string().min(3).max(500).required()
                .messages({
                    'string.empty': 'Location is required'
                }),
            description: Joi.string().max(2000).optional().allow('', null),
            total_units: Joi.number().integer().min(0).optional(),
            status: Joi.string().valid('Planning', 'Under Construction', 'Completed', 'On Hold').optional()
                .messages({
                    'any.only': 'Status must be one of: Planning, Under Construction, Completed, On Hold'
                })
        })
    },

    updateProject: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        }),
        body: Joi.object({
            name: Joi.string().min(3).max(255).optional(),
            location: Joi.string().min(3).max(500).optional(),
            description: Joi.string().max(2000).optional().allow('', null),
            total_units: Joi.number().integer().min(0).optional(),
            status: Joi.string().valid('Planning', 'Under Construction', 'Completed', 'On Hold').optional(),
            is_active: Joi.boolean().optional()
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    getProject: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        })
    },

    deleteProject: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        })
    }
};

module.exports = projectValidationSchemas;

