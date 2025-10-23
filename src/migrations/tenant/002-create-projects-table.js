/**
 * Tenant Migration: Create Projects Table
 * Creates the projects table in each tenant schema
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
            'projects',
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
                    comment: 'Project name'
                },
                location: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                    comment: 'Project location/address'
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: 'Detailed project description'
                },
                total_units: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: 0,
                    comment: 'Total number of units in the project'
                },
                status: {
                    type: DataTypes.ENUM('Planning', 'Under Construction', 'Completed', 'On Hold'),
                    allowNull: false,
                    defaultValue: 'Planning',
                    comment: 'Current project status'
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Whether the project is active'
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
                comment: 'Stores property projects for the tenant'
            }
        );

        // Add indexes
        await queryInterface.addIndex(
            { tableName: 'projects', schema: schemaName },
            ['tenant_id'],
            {
                name: 'idx_projects_tenant_id'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'projects', schema: schemaName },
            ['status'],
            {
                name: 'idx_projects_status'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'projects', schema: schemaName },
            ['is_active'],
            {
                name: 'idx_projects_is_active'
            }
        );

        console.log(`Projects table created in schema: ${schemaName}`);
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {string} schemaName - The tenant schema name
     */
    async down(queryInterface, sequelize, schemaName) {
        await queryInterface.dropTable({ tableName: 'projects', schema: schemaName });
        console.log(`Projects table dropped from schema: ${schemaName}`);
    }
};

