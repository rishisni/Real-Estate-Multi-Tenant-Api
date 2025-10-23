/**
 * Tenant Response DTO (Data Transfer Object)
 * Defines the structure for tenant data in API responses
 * Hides sensitive internal fields
 * @module modules/tenants/dto/tenant-response
 */

/**
 * @typedef {Object} TenantResponseDto
 * @property {number} id - Tenant ID
 * @property {string} name - Tenant/Builder company name
 * @property {string} contact - Primary contact email or phone
 * @property {string} subscription_type - Subscription tier
 * @property {string} schema_name - Database schema name
 * @property {boolean} is_active - Whether tenant is active
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * Transform tenant model instance to response DTO
 * @param {Object} tenant - Tenant model instance or plain object
 * @returns {TenantResponseDto}
 */
class TenantResponseDto {
    constructor(tenant) {
        // Extract plain values if it's a Sequelize model instance
        const data = tenant.get ? tenant.get({ plain: true }) : tenant;

        this.id = data.id;
        this.name = data.name;
        this.contact = data.contact;
        this.subscription_type = data.subscription_type;
        this.schema_name = data.schema_name;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Transform array of tenants to response DTOs
     * @param {Array} tenants - Array of tenant model instances
     * @returns {TenantResponseDto[]}
     */
    static fromArray(tenants) {
        return tenants.map(tenant => new TenantResponseDto(tenant));
    }
}

module.exports = TenantResponseDto;

