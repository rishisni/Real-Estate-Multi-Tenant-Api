/**
 * Update User DTO (Data Transfer Object)
 * Defines the structure for updating user information
 * @module modules/users/dto/update-user
 */

/**
 * @typedef {Object} UpdateUserDto
 * @property {string} [name] - User full name
 * @property {string} [email] - User email address
 * @property {string} [password] - User password (plain text, will be hashed)
 * @property {('Admin'|'Sales'|'Viewer')} [role] - User role (Super Admin role cannot be changed via this DTO)
 * @property {boolean} [is_active] - Whether user is active
 */

/**
 * Create an UpdateUserDto from request body
 * Only includes fields that are actually provided (partial update)
 * @param {Object} data - Raw request data
 * @returns {UpdateUserDto}
 */
class UpdateUserDto {
    constructor(data) {
        // Only include fields that are provided
        if (data.name !== undefined) this.name = data.name;
        if (data.email !== undefined) this.email = data.email;
        if (data.password !== undefined) this.password = data.password;
        if (data.role !== undefined) this.role = data.role;
        if (data.is_active !== undefined) this.is_active = data.is_active;
    }

    /**
     * Check if DTO has any updatable fields
     * @returns {boolean}
     */
    hasUpdates() {
        return Object.keys(this).length > 0;
    }
}

module.exports = UpdateUserDto;

