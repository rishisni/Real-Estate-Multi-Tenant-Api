/**
 * Tenant Migration: Create Audit Logs Table
 * Creates the audit_logs table in each tenant schema for tracking all actions
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
            'audit_logs',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    comment: 'ID of the user who performed the action'
                },
                user_name: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    comment: 'Name of the user (denormalized for historical accuracy)'
                },
                action: {
                    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'BOOK', 'ACTIVATE', 'DEACTIVATE'),
                    allowNull: false,
                    comment: 'Type of action performed'
                },
                entity: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    comment: 'Entity type (e.g., project, unit, user)'
                },
                entity_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    comment: 'ID of the affected entity'
                },
                old_values: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    comment: 'Previous values (for UPDATE and DELETE actions)'
                },
                new_values: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                    comment: 'New values (for CREATE and UPDATE actions)'
                },
                ip_address: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                    comment: 'IP address of the user'
                },
                user_agent: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: 'Browser user agent string'
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    comment: 'Timestamp of the action'
                }
            },
            {
                schema: schemaName,
                comment: 'Stores audit trail of all actions within the tenant'
            }
        );

        // Add indexes for efficient querying
        await queryInterface.addIndex(
            { tableName: 'audit_logs', schema: schemaName },
            ['user_id'],
            {
                name: 'idx_audit_logs_user_id'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'audit_logs', schema: schemaName },
            ['entity', 'entity_id'],
            {
                name: 'idx_audit_logs_entity'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'audit_logs', schema: schemaName },
            ['action'],
            {
                name: 'idx_audit_logs_action'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'audit_logs', schema: schemaName },
            ['created_at'],
            {
                name: 'idx_audit_logs_created_at'
            }
        );

        console.log(`Audit logs table created in schema: ${schemaName}`);
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {string} schemaName - The tenant schema name
     */
    async down(queryInterface, sequelize, schemaName) {
        await queryInterface.dropTable({ tableName: 'audit_logs', schema: schemaName });
        console.log(`Audit logs table dropped from schema: ${schemaName}`);
    }
};

