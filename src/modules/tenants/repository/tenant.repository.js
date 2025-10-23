/**
 * Tenant Repository
 * Handles all database operations for tenants
 * This is the ONLY layer that directly interacts with the Tenant model
 * @module modules/tenants/repository/tenant.repository
 */

const { sequelize } = require('../../../config/db');
const { DataTypes } = require('sequelize');

/**
 * Tenant Model Definition (Public Schema)
 * This model is always scoped to the public schema
 */
const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    contact: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    subscription_type: {
        type: DataTypes.ENUM('Basic', 'Premium'),
        allowNull: false,
        defaultValue: 'Basic'
    },
    schema_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'tenants',
    schema: 'public',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

class TenantRepository {
    /**
     * Create a new tenant
     * @param {Object} tenantData - Tenant data
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<Object>} Created tenant
     */
    async create(tenantData, transaction = null) {
        return await Tenant.create(tenantData, { transaction });
    }

    /**
     * Find tenant by ID
     * @param {number} id - Tenant ID
     * @returns {Promise<Object|null>} Tenant or null if not found
     */
    async findById(id) {
        return await Tenant.findByPk(id);
    }

    /**
     * Find tenant by schema name
     * @param {string} schemaName - Schema name
     * @returns {Promise<Object|null>} Tenant or null if not found
     */
    async findBySchemaName(schemaName) {
        return await Tenant.findOne({
            where: { schema_name: schemaName }
        });
    }

    /**
     * Find all tenants with optional filters
     * @param {Object} options - Query options
     * @param {boolean} options.activeOnly - Only return active tenants
     * @param {number} options.limit - Limit results
     * @param {number} options.offset - Offset for pagination
     * @returns {Promise<Object[]>} Array of tenants
     */
    async findAll(options = {}) {
        const where = {};
        
        if (options.activeOnly) {
            where.is_active = true;
        }

        return await Tenant.findAll({
            where,
            limit: options.limit,
            offset: options.offset,
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Count all tenants with optional filters
     * @param {Object} options - Query options
     * @param {boolean} options.activeOnly - Only count active tenants
     * @returns {Promise<number>} Count of tenants
     */
    async count(options = {}) {
        const where = {};
        
        if (options.activeOnly) {
            where.is_active = true;
        }

        return await Tenant.count({ where });
    }

    /**
     * Update tenant by ID
     * @param {number} id - Tenant ID
     * @param {Object} updateData - Data to update
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<[number, Object[]]>} [affectedCount, affectedRows]
     */
    async update(id, updateData, transaction = null) {
        return await Tenant.update(updateData, {
            where: { id },
            transaction,
            returning: true
        });
    }

    /**
     * Activate a tenant
     * @param {number} id - Tenant ID
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<[number]>} Number of affected rows
     */
    async activate(id, transaction = null) {
        const [affectedCount] = await Tenant.update(
            { is_active: true },
            { where: { id }, transaction }
        );
        return affectedCount;
    }

    /**
     * Deactivate a tenant
     * @param {number} id - Tenant ID
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<[number]>} Number of affected rows
     */
    async deactivate(id, transaction = null) {
        const [affectedCount] = await Tenant.update(
            { is_active: false },
            { where: { id }, transaction }
        );
        return affectedCount;
    }

    /**
     * Delete a tenant (soft delete - sets is_active to false)
     * @param {number} id - Tenant ID
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<number>} Number of affected rows
     */
    async softDelete(id, transaction = null) {
        return await this.deactivate(id, transaction);
    }

    /**
     * Check if schema name already exists
     * @param {string} schemaName - Schema name to check
     * @returns {Promise<boolean>} True if exists, false otherwise
     */
    async schemaNameExists(schemaName) {
        const count = await Tenant.count({
            where: { schema_name: schemaName }
        });
        return count > 0;
    }
}

module.exports = new TenantRepository();

