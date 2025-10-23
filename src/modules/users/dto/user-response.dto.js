/**
 * User Response DTO (Data Transfer Object)
 * Defines the structure for user data in API responses
 * Hides sensitive fields like password_hash
 * @module modules/users/dto/user-response
 */

/**
 * @typedef {Object} UserResponseDto
 * @property {number} id - User ID
 * @property {number} [tenant_id] - Tenant ID (only for tenant users)
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {boolean} is_active - Whether user is active
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * Transform user model instance to response DTO
 * @param {Object} user - User model instance or plain object
 * @returns {UserResponseDto}
 */
class UserResponseDto {
    constructor(user) {
        // Extract plain values if it's a Sequelize model instance
        const data = user.get ? user.get({ plain: true }) : user;

        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        
        // Only include tenant_id for non-Super Admin users
        if (data.tenant_id) {
            this.tenant_id = data.tenant_id;
        }

        if (data.created_at) {
            this.created_at = data.created_at;
        }
        
        if (data.updated_at) {
            this.updated_at = data.updated_at;
        }

        // Explicitly exclude sensitive fields
        // password, password_hash are never included
    }

    /**
     * Transform array of users to response DTOs
     * @param {Array} users - Array of user model instances
     * @returns {UserResponseDto[]}
     */
    static fromArray(users) {
        return users.map(user => new UserResponseDto(user));
    }

    /**
     * Create a login response with token
     * @param {Object} user - User data
     * @param {string} token - JWT token
     * @param {string} [tenant_schema] - Tenant schema name
     * @returns {Object} Login response with user and token
     */
    static withToken(user, token, tenant_schema = null) {
        return {
            user: new UserResponseDto(user),
            token,
            ...(tenant_schema && { tenant_schema })
        };
    }
}

module.exports = UserResponseDto;

