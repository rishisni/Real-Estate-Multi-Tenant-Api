/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 * Supports both Super Admin (public schema) and Tenant users (tenant schemas)
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const { sendError } = require('../utils/response');

/**
 * Middleware to authenticate JWT tokens
 * Extracts and verifies JWT from Authorization header
 * Attaches decoded user info to req.user
 * 
 * Expected token payload:
 * - For Super Admin: { id, email, role: 'Super Admin' }
 * - For Tenant Users: { id, email, role, tenant_id, tenant_schema }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
    try {
        // Extract token from Authorization header (Bearer <token>)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('Access denied. No token provided.');
        }

        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user information to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            tenant_id: decoded.tenant_id || null,
            tenant_schema: decoded.tenant_schema || null
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return sendError(res, new UnauthorizedError('Invalid token'), 401);
        } else if (error.name === 'TokenExpiredError') {
            return sendError(res, new UnauthorizedError('Token expired'), 401);
        } else if (error instanceof UnauthorizedError) {
            return sendError(res, error, 401);
        } else {
            return sendError(res, new UnauthorizedError('Authentication failed'), 401);
        }
    }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token is present
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                tenant_id: decoded.tenant_id || null,
                tenant_schema: decoded.tenant_schema || null
            };
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without setting req.user
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};