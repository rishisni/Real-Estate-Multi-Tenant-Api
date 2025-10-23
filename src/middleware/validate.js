// src/middleware/validate.js
const Joi = require('joi');

/**
 * Middleware to validate request data (body, params, query) against a Joi schema.
 * @param {object} schema - An object containing Joi schemas for body, params, and/or query.
 * Example: { body: Joi.object({...}), params: Joi.object({...}) }
 */
const validate = (schema) => (req, res, next) => {
    // Collect validation errors
    const validationErrors = {};

    // 1. Validate request body (for POST/PUT)
    if (schema.body) {
        const { error } = schema.body.validate(req.body, { abortEarly: false });
        if (error) {
            validationErrors.body = error.details.map(detail => ({
                field: detail.context.key,
                message: detail.message.replace(/"/g, '') // Remove quotes for cleaner error messages
            }));
        }
    }

    // 2. Validate request query (for GET filters)
    if (schema.query) {
        const { error } = schema.query.validate(req.query, { abortEarly: false });
        if (error) {
            validationErrors.query = error.details.map(detail => ({
                field: detail.context.key,
                message: detail.message.replace(/"/g, '')
            }));
        }
    }
    
    // 3. Validate request parameters (for IDs in URLs)
    if (schema.params) {
        const { error } = schema.params.validate(req.params, { abortEarly: false });
        if (error) {
            validationErrors.params = error.details.map(detail => ({
                field: detail.context.key,
                message: detail.message.replace(/"/g, '')
            }));
        }
    }

    // Check if any errors occurred
    if (Object.keys(validationErrors).length > 0) {
        // Return 400 Bad Request with detailed errors
        return res.status(400).json({ 
            message: 'Validation failed.',
            errors: validationErrors 
        });
    }

    // Validation passed, continue to the controller
    next();
};

module.exports = validate;