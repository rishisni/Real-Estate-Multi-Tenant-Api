/**
 * Create Tenant DTO (Data Transfer Object)
 * Defines the structure for creating a new tenant
 * @module modules/tenants/dto/create-tenant
 */

/**
 * @typedef {Object} CreateTenantDto
 * @property {string} name - Tenant/Builder company name
 * @property {string} contact - Primary contact email or phone
 * @property {('Basic'|'Premium')} subscription_type - Subscription tier
 * @property {string} adminName - Initial admin user's full name
 * @property {string} adminEmail - Initial admin user's email
 * @property {string} adminPassword - Initial admin user's password
 */

/**
 * Create a CreateTenantDto from request body
 * @param {Object} data - Raw request data
 * @returns {CreateTenantDto}
 */
class CreateTenantDto {
    constructor(data) {
        this.name = data.name;
        this.contact = data.contact;
        this.subscription_type = data.subscription_type;
        this.adminName = data.adminName;
        this.adminEmail = data.adminEmail;
        this.adminPassword = data.adminPassword;
    }

    /**
     * Get tenant data only (without admin fields)
     * @returns {Object}
     */
    getTenantData() {
        return {
            name: this.name,
            contact: this.contact,
            subscription_type: this.subscription_type
        };
    }

    /**
     * Get admin user data
     * @param {number} tenantId - The newly created tenant ID
     * @returns {Object}
     */
    getAdminData(tenantId) {
        return {
            tenant_id: tenantId,
            name: this.adminName,
            email: this.adminEmail,
            password: this.adminPassword,
            role: 'Admin'
        };
    }
}

module.exports = CreateTenantDto;

