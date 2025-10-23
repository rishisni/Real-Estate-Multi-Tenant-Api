/**
 * Update Tenant DTO (Data Transfer Object)
 * Defines the structure for updating tenant information
 * @module modules/tenants/dto/update-tenant
 */

/**
 * @typedef {Object} UpdateTenantDto
 * @property {string} [name] - Tenant/Builder company name
 * @property {string} [contact] - Primary contact email or phone
 * @property {('Basic'|'Premium')} [subscription_type] - Subscription tier
 */

/**
 * Create an UpdateTenantDto from request body
 * Only includes fields that are actually provided (partial update)
 * @param {Object} data - Raw request data
 * @returns {UpdateTenantDto}
 */
class UpdateTenantDto {
    constructor(data) {
        // Only include fields that are provided
        if (data.name !== undefined) this.name = data.name;
        if (data.contact !== undefined) this.contact = data.contact;
        if (data.subscription_type !== undefined) this.subscription_type = data.subscription_type;
    }

    /**
     * Check if DTO has any updatable fields
     * @returns {boolean}
     */
    hasUpdates() {
        return Object.keys(this).length > 0;
    }
}

module.exports = UpdateTenantDto;

