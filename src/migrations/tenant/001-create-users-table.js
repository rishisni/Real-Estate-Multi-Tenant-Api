/**
 * Tenant Migration: Create Users Table
 * Creates the users table in each tenant schema for tenant-specific users
 * (Admin, Sales, Viewer roles)
 */

const { DataTypes } = require('sequelize');

module.exports = {
    /**
     * Run the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {string} schemaName - The tenant schema name
     */
    async up(queryInterface, sequelize, schemaName) {
        await queryInterface.createTable(
            'users',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                tenant_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    comment: 'Reference to tenant in public.tenants table'
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'User full name'
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'User email (unique within tenant schema)'
                },
                password_hash: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'Bcrypt hashed password'
                },
                role: {
                    type: DataTypes.ENUM('Admin', 'Sales', 'Viewer'),
                    allowNull: false,
                    comment: 'User role within the tenant'
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Whether the user account is active'
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
                schema: schemaName,
                comment: 'Stores tenant-specific users (Admin, Sales, Viewer)'
            }
        );

        // Add indexes
        await queryInterface.addIndex(
            { tableName: 'users', schema: schemaName },
            ['email'],
            {
                name: 'idx_users_email',
                unique: true
            }
        );

        await queryInterface.addIndex(
            { tableName: 'users', schema: schemaName },
            ['tenant_id'],
            {
                name: 'idx_users_tenant_id'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'users', schema: schemaName },
            ['is_active'],
            {
                name: 'idx_users_is_active'
            }
        );

        console.log(`Users table created in schema: ${schemaName}`);
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {string} schemaName - The tenant schema name
     */
    async down(queryInterface, sequelize, schemaName) {
        await queryInterface.dropTable({ tableName: 'users', schema: schemaName });
        console.log(`Users table dropped from schema: ${schemaName}`);
    }
};

