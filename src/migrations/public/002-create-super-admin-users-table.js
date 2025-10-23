/**
 * Migration: Create Super Admin Users Table
 * Creates the users table in public schema for Super Admin accounts only
 * Regular tenant users are stored in their respective tenant schemas
 */

const { DataTypes } = require('sequelize');

module.exports = {
    /**
     * Run the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     */
    async up(queryInterface) {
        await queryInterface.createTable(
            'users',
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
                    comment: 'Super Admin full name'
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true,
                    comment: 'Super Admin email (used for login)'
                },
                password_hash: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    comment: 'Bcrypt hashed password'
                },
                role: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: 'Super Admin',
                    comment: 'Should always be "Super Admin" for public schema users'
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Whether the super admin account is active'
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
                comment: 'Stores Super Admin users who can manage all tenants'
            }
        );

        // Add indexes
        await queryInterface.addIndex('users', ['email'], {
            name: 'idx_super_admin_users_email',
            unique: true
        });

        await queryInterface.addIndex('users', ['is_active'], {
            name: 'idx_super_admin_users_is_active'
        });

        console.log('Super Admin users table created successfully in public schema');
    },

    /**
     * Rollback the migration
     * @param {import('sequelize').QueryInterface} queryInterface
     */
    async down(queryInterface) {
        await queryInterface.dropTable('users');
        console.log('Super Admin users table dropped from public schema');
    }
};

