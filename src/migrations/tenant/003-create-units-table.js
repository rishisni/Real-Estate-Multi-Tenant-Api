/**
 * Tenant Migration: Create Units Table
 * Creates the units table in each tenant schema with foreign key to projects
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
            'units',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                project_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    comment: 'Reference to project in this schema',
                    references: {
                        model: {
                            tableName: 'projects',
                            schema: schemaName
                        },
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                unit_number: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    comment: 'Unit number or identifier (e.g., A-101, B-205)'
                },
                floor: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: 'Floor number'
                },
                area: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    comment: 'Unit area in square feet or square meters'
                },
                bedrooms: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: 'Number of bedrooms'
                },
                bathrooms: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: 'Number of bathrooms'
                },
                price: {
                    type: DataTypes.DECIMAL(15, 2),
                    allowNull: false,
                    comment: 'Unit price'
                },
                status: {
                    type: DataTypes.ENUM('Available', 'Booked', 'Sold'),
                    allowNull: false,
                    defaultValue: 'Available',
                    comment: 'Current unit status'
                },
                booked_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: 'User ID who booked the unit (if status is Booked)'
                },
                booked_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    comment: 'Timestamp when unit was booked'
                },
                sold_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    comment: 'Timestamp when unit was sold'
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Whether the unit is active'
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
                comment: 'Stores property units within projects'
            }
        );

        // Add indexes for better query performance
        await queryInterface.addIndex(
            { tableName: 'units', schema: schemaName },
            ['project_id'],
            {
                name: 'idx_units_project_id'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'units', schema: schemaName },
            ['status'],
            {
                name: 'idx_units_status'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'units', schema: schemaName },
            ['price'],
            {
                name: 'idx_units_price'
            }
        );

        await queryInterface.addIndex(
            { tableName: 'units', schema: schemaName },
            ['is_active'],
            {
                name: 'idx_units_is_active'
            }
        );

        // Composite index for common filter queries
        await queryInterface.addIndex(
            { tableName: 'units', schema: schemaName },
            ['project_id', 'status'],
            {
                name: 'idx_units_project_status'
            }
        );

        console.log(`Units table created in schema: ${schemaName}`);
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {string} schemaName - The tenant schema name
     */
    async down(queryInterface, sequelize, schemaName) {
        await queryInterface.dropTable({ tableName: 'units', schema: schemaName });
        console.log(`Units table dropped from schema: ${schemaName}`);
    }
};

