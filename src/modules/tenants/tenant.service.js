/**
 * Tenant Service
 * Contains business logic for tenant management
 * Uses repository for data access and DTOs for data transformation
 * @module modules/tenants/tenant.service
 */

const { sequelize } = require('../../config/db');
const tenantRepository = require('./repository/tenant.repository');
const CreateTenantDto = require('./dto/create-tenant.dto');
const UpdateTenantDto = require('./dto/update-tenant.dto');
const TenantResponseDto = require('./dto/tenant-response.dto');
const { generateSchemaName, createSchema } = require('../../utils/schemaManager');
const { runTenantMigration } = require('../../migrations/umzug-tenant');
const { NotFoundError, ConflictError, InternalServerError } = require('../../utils/errors');
const bcrypt = require('bcryptjs');

class TenantService {
    /**
     * Create a new tenant with its own schema and admin user
     * @param {CreateTenantDto} dto - Tenant creation data
     * @returns {Promise<TenantResponseDto>} Created tenant
     */
    async createTenant(dto) {
        const transaction = await sequelize.transaction();

        try {
            // Generate schema name based on tenant ID (will be set after creation)
            // For now, create a temporary schema name from the tenant name
            const tempSchemaName = 'tenant_' + dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

            // Check if tenant name already exists
            const existingTenant = await tenantRepository.findBySchemaName(tempSchemaName);
            if (existingTenant) {
                throw new ConflictError('A tenant with similar name already exists');
            }

            // 1. Create tenant record in public schema
            const tenantData = {
                ...dto.getTenantData(),
                schema_name: tempSchemaName,
                is_active: true
            };

            const tenant = await tenantRepository.create(tenantData, transaction);
            const tenantId = tenant.id;

            // Update schema name to use tenant ID
            const schemaName = generateSchemaName(tenantId);
            await tenantRepository.update(tenantId, { schema_name: schemaName }, transaction);

            // 2. Create database schema
            await createSchema(schemaName);

            // 3. Run migrations on the new tenant schema
            await runTenantMigration(schemaName, 'up');

            // 4. Create admin user in tenant schema
            await this.createAdminUser(schemaName, dto.getAdminData(tenantId), transaction);

            // Commit transaction
            await transaction.commit();

            // Fetch and return the created tenant with updated schema name
            const createdTenant = await tenantRepository.findById(tenantId);
            return new TenantResponseDto(createdTenant);

        } catch (error) {
            // Rollback transaction
            await transaction.rollback();

            // Log error
            console.error('Tenant creation failed:', error);

            // Attempt to clean up schema if it was created
            if (error.schemaName) {
                try {
                    await sequelize.query(`DROP SCHEMA IF EXISTS "${error.schemaName}" CASCADE;`);
                } catch (cleanupError) {
                    console.error('Failed to cleanup schema:', cleanupError);
                }
            }

            // Re-throw appropriate error
            if (error instanceof ConflictError || error instanceof NotFoundError) {
                throw error;
            }
            throw new InternalServerError('Failed to create tenant: ' + error.message);
        }
    }

    /**
     * Create admin user in tenant schema
     * @param {string} schemaName - Tenant schema name
     * @param {Object} adminData - Admin user data
     * @param {Object} transaction - Sequelize transaction
     * @private
     */
    async createAdminUser(schemaName, adminData, transaction) {
        try {
            // Hash password
            const password_hash = await bcrypt.hash(adminData.password, 10);

            // Insert admin user directly into tenant schema
            await sequelize.query(
                `INSERT INTO "${schemaName}".users 
                (tenant_id, name, email, password_hash, role, is_active, created_at, updated_at)
                VALUES (:tenant_id, :name, :email, :password_hash, :role, true, NOW(), NOW())`,
                {
                    replacements: {
                        tenant_id: adminData.tenant_id,
                        name: adminData.name,
                        email: adminData.email,
                        password_hash: password_hash,
                        role: adminData.role
                    },
                    transaction
                }
            );
        } catch (error) {
            console.error('Failed to create admin user:', error);
            throw new InternalServerError('Failed to create admin user');
        }
    }

    /**
     * Get all tenants with pagination
     * @param {Object} options - Query options
     * @param {number} options.page - Page number
     * @param {number} options.limit - Items per page
     * @param {boolean} options.activeOnly - Only active tenants
     * @returns {Promise<{tenants: TenantResponseDto[], total: number, page: number, limit: number}>}
     */
    async getAllTenants(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const tenants = await tenantRepository.findAll({
            activeOnly: options.activeOnly,
            limit,
            offset
        });

        const total = await tenantRepository.count({ activeOnly: options.activeOnly });

        return {
            tenants: TenantResponseDto.fromArray(tenants),
            total,
            page,
            limit
        };
    }

    /**
     * Get tenant by ID
     * @param {number} id - Tenant ID
     * @returns {Promise<TenantResponseDto>}
     */
    async getTenantById(id) {
        const tenant = await tenantRepository.findById(id);
        
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }

        return new TenantResponseDto(tenant);
    }

    /**
     * Update tenant
     * @param {number} id - Tenant ID
     * @param {UpdateTenantDto} dto - Update data
     * @returns {Promise<TenantResponseDto>}
     */
    async updateTenant(id, dto) {
        const tenant = await tenantRepository.findById(id);
        
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }

        if (!dto.hasUpdates()) {
            return new TenantResponseDto(tenant);
        }

        await tenantRepository.update(id, dto);
        const updatedTenant = await tenantRepository.findById(id);

        return new TenantResponseDto(updatedTenant);
    }

    /**
     * Activate a tenant
     * @param {number} id - Tenant ID
     * @returns {Promise<TenantResponseDto>}
     */
    async activateTenant(id) {
        const tenant = await tenantRepository.findById(id);
        
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }

        if (tenant.is_active) {
            return new TenantResponseDto(tenant);
        }

        await tenantRepository.activate(id);
        const updatedTenant = await tenantRepository.findById(id);

        return new TenantResponseDto(updatedTenant);
    }

    /**
     * Deactivate a tenant
     * @param {number} id - Tenant ID
     * @returns {Promise<TenantResponseDto>}
     */
    async deactivateTenant(id) {
        const tenant = await tenantRepository.findById(id);
        
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }

        if (!tenant.is_active) {
            return new TenantResponseDto(tenant);
        }

        await tenantRepository.deactivate(id);
        const updatedTenant = await tenantRepository.findById(id);

        return new TenantResponseDto(updatedTenant);
    }

    /**
     * Get tenant statistics
     * Used by Super Admin dashboard
     * @returns {Promise<Object>} Tenant statistics
     */
    async getTenantStats() {
        const totalTenants = await tenantRepository.count();
        const activeTenants = await tenantRepository.count({ activeOnly: true });
        const inactiveTenants = totalTenants - activeTenants;

        return {
            total: totalTenants,
            active: activeTenants,
            inactive: inactiveTenants
        };
    }
}

module.exports = new TenantService();