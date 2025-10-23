/**
 * Unit Validation Schemas
 * @module modules/units/unit.schema
 */

const Joi = require('joi');

const unitValidationSchemas = {
    createUnit: {
        body: Joi.object({
            project_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Project ID must be a number',
                    'any.required': 'Project ID is required'
                }),
            unit_number: Joi.string().min(1).max(100).required()
                .messages({
                    'string.empty': 'Unit number is required'
                }),
            floor: Joi.number().integer().optional().allow(null),
            area: Joi.number().positive().required()
                .messages({
                    'number.base': 'Area must be a number',
                    'any.required': 'Area is required'
                }),
            bedrooms: Joi.number().integer().min(0).optional().allow(null),
            bathrooms: Joi.number().integer().min(0).optional().allow(null),
            price: Joi.number().positive().required()
                .messages({
                    'number.base': 'Price must be a number',
                    'any.required': 'Price is required'
                })
        })
    },

    updateUnit: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        }),
        body: Joi.object({
            unit_number: Joi.string().min(1).max(100).optional(),
            floor: Joi.number().integer().optional().allow(null),
            area: Joi.number().positive().optional(),
            bedrooms: Joi.number().integer().min(0).optional().allow(null),
            bathrooms: Joi.number().integer().min(0).optional().allow(null),
            price: Joi.number().positive().optional(),
            is_active: Joi.boolean().optional()
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    getUnit: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        })
    },

    bookUnit: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        })
    },

    deleteUnit: {
        params: Joi.object({
            id: Joi.number().integer().positive().required()
        })
    },

    filterUnits: {
        query: Joi.object({
            page: Joi.number().integer().min(1).optional(),
            limit: Joi.number().integer().min(1).max(100).optional(),
            activeOnly: Joi.boolean().optional(),
            project_id: Joi.number().integer().positive().optional(),
            status: Joi.string().valid('Available', 'Booked', 'Sold').optional(),
            min_price: Joi.number().positive().optional(),
            max_price: Joi.number().positive().optional(),
            bedrooms: Joi.number().integer().min(0).optional()
        })
    }
};

module.exports = unitValidationSchemas;

