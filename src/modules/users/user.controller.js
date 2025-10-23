/**
 * User Controller
 * Handles HTTP requests for user management and authentication
 * @module modules/users/user.controller
 */

const userService = require('./user.service');
const CreateUserDto = require('./dto/create-user.dto');
const UpdateUserDto = require('./dto/update-user.dto');
const LoginDto = require('./dto/login.dto');
const { sendSuccess, sendCreated, sendError, sendNoContent } = require('../../utils/response');
const { NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } = require('../../utils/errors');

class UserController {
    /**
     * Super Admin login
     * POST /api/v1/auth/super-admin/login
     */
    async superAdminLogin(req, res) {
        try {
            const dto = new LoginDto(req.body);
            const result = await userService.superAdminLogin(dto);
            
            return sendSuccess(res, result, 'Login successful');
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
                return sendError(res, error, 401);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Tenant user login
     * POST /api/v1/auth/login
     */
    async tenantUserLogin(req, res) {
        try {
            const dto = new LoginDto(req.body);
            const result = await userService.tenantUserLogin(dto);
            
            return sendSuccess(res, result, 'Login successful');
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
                return sendError(res, error, 401);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Refresh authentication token
     * POST /api/v1/auth/refresh
     */
    async refreshToken(req, res) {
        try {
            const result = await userService.refreshToken(req.user);
            
            return sendSuccess(res, result, 'Token refreshed successfully');
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                return sendError(res, error, 401);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Create a new user
     * POST /api/v1/users
     */
    async createUser(req, res, next) {
        try {
            const dto = new CreateUserDto(req.body, req.tenantId);
            const user = await userService.createUser(dto, req.tenantSchema);
            
            res.locals.auditData = {
                entityId: user.id,
                newValues: user
            };
            
            sendCreated(res, user, 'User created successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof ConflictError) {
                return sendError(res, error, 409);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Get all users (with pagination)
     * GET /api/v1/users
     */
    async getAllUsers(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                activeOnly: req.query.activeOnly === 'true'
            };

            const result = await userService.getAllUsers(req.tenantSchema, options);
            
            return sendSuccess(res, result, 'Users retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    /**
     * Get user by ID
     * GET /api/v1/users/:id
     */
    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id, req.tenantSchema);
            
            return sendSuccess(res, user, 'User retrieved successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Update user
     * PATCH /api/v1/users/:id
     */
    async updateUser(req, res, next) {
        try {
            const oldUser = await userService.getUserById(req.params.id, req.tenantSchema);
            const dto = new UpdateUserDto(req.body);
            const user = await userService.updateUser(req.params.id, dto, req.tenantSchema);
            
            res.locals.auditData = {
                entityId: user.id,
                oldValues: oldUser,
                newValues: user
            };
            
            sendSuccess(res, user, 'User updated successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            } else if (error instanceof ConflictError) {
                return sendError(res, error, 409);
            }
            return sendError(res, error, 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/v1/users/:id
     */
    async deleteUser(req, res, next) {
        try {
            const oldUser = await userService.getUserById(req.params.id, req.tenantSchema);
            await userService.deleteUser(req.params.id, req.tenantSchema);
            
            res.locals.auditData = {
                entityId: req.params.id,
                oldValues: oldUser
            };
            
            sendSuccess(res, null, 'User deleted successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }
}

module.exports = new UserController();