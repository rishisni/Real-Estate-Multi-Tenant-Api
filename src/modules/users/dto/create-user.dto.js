/**
 * Create User DTO (Data Transfer Object)
 * Defines the structure for creating a new user
 * @module modules/users/dto/create-user
 */

/**
 * @typedef {Object} CreateUserDto
 * @property {number} [tenant_id] - Tenant ID (only for tenant users, not Super Admin)
 * @property {string} name - User full name
 * @property {string} email - User email address
 * @property {string} password - User password (plain text, will be hashed)
 * @property {('Super Admin'|'Admin'|'Sales'|'Viewer')} role - User role
 */

/**
 * Create a CreateUserDto from request body
 * @param {Object} data - Raw request data
 * @param {number} [tenantId] - Tenant ID from context (for tenant users)
 * @returns {CreateUserDto}
 */
class CreateUserDto {
    constructor(data, tenantId = null) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        
        // For tenant users, use provided tenant ID or from context
        if (tenantId) {
            this.tenant_id = tenantId;
        } else if (data.tenant_id) {
            this.tenant_id = data.tenant_id;
        }
    }

    /**
     * Check if this is for a Super Admin user
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this.role === 'Super Admin';
    }
}

module.exports = CreateUserDto;

