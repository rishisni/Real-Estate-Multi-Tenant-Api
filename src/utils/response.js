/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all endpoints
 * @module utils/response
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        status: 'success',
        message,
        data
    };

    return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send a no content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, error, statusCode = 500) => {
    const response = {
        status: 'error',
        message: error.message || 'Internal server error',
        ...(error.errors && { errors: error.errors }), // Include validation errors if present
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }) // Stack trace in development
    };

    return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, page, limit, total, message = 'Success') => {
    const response = {
        status: 'success',
        message,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };

    return res.status(200).json(response);
};

module.exports = {
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendError,
    sendPaginated
};

