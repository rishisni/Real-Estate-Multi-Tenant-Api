/**
 * User Service
 * Contains business logic for user management and authentication
 * Uses repository for data access and DTOs for data transformation
 * @module modules/users/user.service
 */

const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');
const userRepository = require('./repository/user.repository');
const CreateUserDto = require('./dto/create-user.dto');
const UpdateUserDto = require('./dto/update-user.dto');
const LoginDto = require('./dto/login.dto');
const UserResponseDto = require('./dto/user-response.dto');
const { NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } = require('../../utils/errors');

class UserService {
    /**
     * Super Admin login
     * Authenticates against public schema users table
     * @param {LoginDto} dto - Login credentials
     * @returns {Promise<Object>} User data with JWT token
     */
    async superAdminLogin(dto) {
        try {
            // Find user in public schema
            const user = await userRepository.findByEmail(dto.email, 'public');

            if (!user) {
                logger.logAuth(dto.email, false, 'User not found', 'N/A');
                throw new UnauthorizedError('Invalid credentials');
            }

            // Verify role is Super Admin
            if (user.role !== 'Super Admin') {
                logger.logAuth(dto.email, false, 'Not a Super Admin', 'N/A');
                throw new UnauthorizedError('Invalid credentials');
            }

            // Verify password
            const isValidPassword = await userRepository.verifyPassword(dto.password, user.password_hash);
            if (!isValidPassword) {
                logger.logAuth(dto.email, false, 'Invalid password', 'N/A');
                throw new UnauthorizedError('Invalid credentials');
            }

            // Check if user is active
            if (!user.is_active) {
                logger.logAuth(dto.email, false, 'Account deactivated', 'N/A');
                throw new ForbiddenError('Account is deactivated');
            }

            // Generate JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.logAuth(dto.email, true, 'Super Admin login successful', 'N/A');
            logger.info(`Super Admin logged in: ${dto.email}`);

            return UserResponseDto.withToken(user, token);
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
                throw error;
            }
            logger.error('Super Admin login error', { email: dto.email, error: error.message });
            throw error;
        }
    }

    /**
     * Tenant user login
     * Searches for user across all tenant schemas
     * @param {LoginDto} dto - Login credentials
     * @returns {Promise<Object>} User data with JWT token
     */
    async tenantUserLogin(dto) {
        try {
            // Find user across all tenant schemas
            const result = await userRepository.findByEmailAcrossTenants(dto.email);

            if (!result) {
                logger.logAuth(dto.email, false, 'User not found in any tenant', 'N/A');
                throw new UnauthorizedError('Invalid credentials');
            }

            const { user, schema, tenant_id } = result;

            // Verify password
            const isValidPassword = await userRepository.verifyPassword(dto.password, user.password_hash);
            if (!isValidPassword) {
                logger.logAuth(dto.email, false, 'Invalid password', 'N/A');
                throw new UnauthorizedError('Invalid credentials');
            }

            // Check if user is active
            if (!user.is_active) {
                logger.logAuth(dto.email, false, 'Account deactivated', 'N/A');
                throw new ForbiddenError('Account is deactivated');
            }

            // Generate JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenant_id: tenant_id,
                    tenant_schema: schema
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.logAuth(dto.email, true, `Tenant user login successful (${schema})`, 'N/A');
            logger.info(`Tenant user logged in: ${dto.email} - Role: ${user.role} - Tenant: ${schema}`);

            return UserResponseDto.withToken(user, token, schema);
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
                throw error;
            }
            logger.error('Tenant user login error', { email: dto.email, error: error.message });
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {CreateUserDto} dto - User creation data
     * @param {string} schemaName - Schema name where user will be created
     * @returns {Promise<UserResponseDto>} Created user
     */
    async createUser(dto, schemaName) {
        // Check if email already exists in the schema
        const emailExists = await userRepository.emailExists(dto.email, schemaName);
        if (emailExists) {
            throw new ConflictError('Email already exists');
        }

        // Create user
        const user = await userRepository.create(dto, schemaName);
        return new UserResponseDto(user);
    }

    /**
     * Get all users in a schema with pagination
     * @param {string} schemaName - Schema name
     * @param {Object} options - Query options
     * @param {number} options.page - Page number
     * @param {number} options.limit - Items per page
     * @param {boolean} options.activeOnly - Only active users
     * @returns {Promise<Object>} Paginated users
     */
    async getAllUsers(schemaName, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await userRepository.findAll(schemaName, {
            activeOnly: options.activeOnly,
            limit,
            offset
        });

        const total = await userRepository.count(schemaName, { activeOnly: options.activeOnly });

        return {
            users: UserResponseDto.fromArray(users),
            total,
            page,
            limit
        };
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @param {string} schemaName - Schema name
     * @returns {Promise<UserResponseDto>} User data
     */
    async getUserById(id, schemaName) {
        const user = await userRepository.findById(id, schemaName);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return new UserResponseDto(user);
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {UpdateUserDto} dto - Update data
     * @param {string} schemaName - Schema name
     * @returns {Promise<UserResponseDto>} Updated user
     */
    async updateUser(id, dto, schemaName) {
        // Check if user exists
        const existingUser = await userRepository.findById(id, schemaName);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // If email is being updated, check if it's already taken
        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await userRepository.emailExists(dto.email, schemaName, id);
            if (emailExists) {
                throw new ConflictError('Email already exists');
            }
        }

        if (!dto.hasUpdates()) {
            return new UserResponseDto(existingUser);
        }

        // Update user
        const updatedUser = await userRepository.update(id, dto, schemaName);
        return new UserResponseDto(updatedUser);
    }

    /**
     * Delete user (soft delete)
     * @param {number} id - User ID
     * @param {string} schemaName - Schema name
     * @returns {Promise<void>}
     */
    async deleteUser(id, schemaName) {
        const user = await userRepository.findById(id, schemaName);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await userRepository.softDelete(id, schemaName);
    }

    /**
     * Refresh authentication token
     * @param {Object} user - Current user from token
     * @returns {Promise<Object>} New token
     */
    async refreshToken(user) {
        // Verify user still exists and is active
        const schemaName = user.role === 'Super Admin' ? 'public' : user.tenant_schema;
        const currentUser = await userRepository.findById(user.id, schemaName);

        if (!currentUser || !currentUser.is_active) {
            throw new UnauthorizedError('User not found or inactive');
        }

        // Generate new token
        const tokenPayload = {
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role
        };

        if (currentUser.tenant_id) {
            tokenPayload.tenant_id = currentUser.tenant_id;
            tokenPayload.tenant_schema = schemaName;
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        return { token };
    }
}

module.exports = new UserService();