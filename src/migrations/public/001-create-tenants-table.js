/**
 * Migration: Create Tenants Table
 * Creates the tenants table in the public schema to store all tenant (builder) information
 */

const { DataTypes } = require('sequelize');

module.exports = {
    /**
     * Run the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     */
    async up(queryInterface) {
        await queryInterface.createTable(
            'tenants',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'Tenant/Builder company name'
                },
                contact: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'Primary contact email or phone'
                },
                subscription_type: {
                    type: DataTypes.ENUM('Basic', 'Premium'),
                    allowNull: false,
                    defaultValue: 'Basic',
                    comment: 'Subscription tier for the tenant'
                },
                schema_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    comment: 'Database schema name for this tenant (e.g., tenant_1)'
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Whether the tenant is active or suspended'
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
            },
            {
                schema: 'public',
                comment: 'Stores all tenant (builder) information with schema isolation'
            }
        );

        // Add indexes for better query performance
        await queryInterface.addIndex('tenants', ['schema_name'], {
            name: 'idx_tenants_schema_name',
            unique: true
        });

        await queryInterface.addIndex('tenants', ['is_active'], {
            name: 'idx_tenants_is_active'
        });

        console.log('Tenants table created successfully in public schema');
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     */
    async down(queryInterface) {
        await queryInterface.dropTable('tenants');
        console.log('Tenants table dropped from public schema');
    }
};

