/**
 * Request Logging Middleware
 * 
 * Logs all HTTP requests with timing and response status
 * Uses Winston logger for structured logging
 */

const logger = require('../config/logger');

/**
 * Middleware to log HTTP requests
 * Captures: method, URL, IP, status code, response time, user
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to log after response is sent
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Log the request
        logger.logRequest(req, statusCode, responseTime);

        // Call the original end function
        originalEnd.apply(res, args);
    };

    next();
};

/**
 * Middleware to log errors
 * Should be used after all routes as error handler
 */
const errorLogger = (err, req, res, next) => {
    logger.logError(err, req);
    next(err); // Pass to next error handler
};

module.exports = {
    requestLogger,
    errorLogger,
};

