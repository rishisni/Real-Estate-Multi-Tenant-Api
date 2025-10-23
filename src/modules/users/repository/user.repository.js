/**
 * User Repository
 * Handles all database operations for users in both public and tenant schemas
 * This is the ONLY layer that directly interacts with User models/tables
 * @module modules/users/repository/user.repository
 */

const { sequelize } = require('../../../config/db');
const bcrypt = require('bcryptjs');

class UserRepository {
    /**
     * Create a new user in specified schema
     * @param {Object} userData - User data
     * @param {string} schemaName - Schema name ('public' for Super Admin, 'tenant_X' for tenant users)
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<Object>} Created user
     */
    async create(userData, schemaName, transaction = null) {
        try {
            // Hash password
            const password_hash = await bcrypt.hash(userData.password, 10);

            const [result] = await sequelize.query(
                `INSERT INTO "${schemaName}".users 
                (${userData.tenant_id ? 'tenant_id,' : ''} name, email, password_hash, role, is_active, created_at, updated_at)
                VALUES (${userData.tenant_id ? ':tenant_id,' : ''} :name, :email, :password_hash, :role, true, NOW(), NOW())
                RETURNING *`,
                {
                    replacements: {
                        tenant_id: userData.tenant_id,
                        name: userData.name,
                        email: userData.email,
                        password_hash,
                        role: userData.role
                    },
                    transaction
                }
            );

            return result[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Find user by ID in specified schema
     * @param {number} id - User ID
     * @param {string} schemaName - Schema name
     * @returns {Promise<Object|null>} User or null if not found
     */
    async findById(id, schemaName) {
        try {
            const [results] = await sequelize.query(
                `SELECT * FROM "${schemaName}".users WHERE id = :id LIMIT 1`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return results || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    }

    /**
     * Find user by email in specified schema
     * @param {string} email - User email
     * @param {string} schemaName - Schema name
     * @returns {Promise<Object|null>} User or null if not found
     */
    async findByEmail(email, schemaName) {
        try {
            const [results] = await sequelize.query(
                `SELECT * FROM "${schemaName}".users WHERE email = :email LIMIT 1`,
                {
                    replacements: { email },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return results || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }

    /**
     * Find user by email across all tenant schemas (for login)
     * @param {string} email - User email
     * @returns {Promise<{user: Object, schema: string}|null>} User with schema or null
     */
    async findByEmailAcrossTenants(email) {
        try {
            // Get all active tenant schemas
            const tenants = await sequelize.query(
                `SELECT id, schema_name, is_active FROM public.tenants WHERE is_active = true`,
                { type: sequelize.QueryTypes.SELECT }
            );

            // Search for user in each tenant schema
            for (const tenant of tenants) {
                const user = await this.findByEmail(email, tenant.schema_name);
                if (user) {
                    return {
                        user,
                        schema: tenant.schema_name,
                        tenant_id: tenant.id
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('Error finding user across tenants:', error);
            return null;
        }
    }

    /**
     * Find all users in specified schema with pagination
     * @param {string} schemaName - Schema name
     * @param {Object} options - Query options
     * @param {number} options.limit - Limit results
     * @param {number} options.offset - Offset for pagination
     * @param {boolean} options.activeOnly - Only active users
     * @returns {Promise<Object[]>} Array of users
     */
    async findAll(schemaName, options = {}) {
        try {
            const whereClause = options.activeOnly ? 'WHERE is_active = true' : '';
            const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
            const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

            const results = await sequelize.query(
                `SELECT * FROM "${schemaName}".users 
                ${whereClause}
                ORDER BY created_at DESC
                ${limitClause} ${offsetClause}`,
                { type: sequelize.QueryTypes.SELECT }
            );

            return results;
        } catch (error) {
            console.error('Error finding all users:', error);
            return [];
        }
    }

    /**
     * Count users in specified schema
     * @param {string} schemaName - Schema name
     * @param {Object} options - Query options
     * @param {boolean} options.activeOnly - Only count active users
     * @returns {Promise<number>} Count of users
     */
    async count(schemaName, options = {}) {
        try {
            const whereClause = options.activeOnly ? 'WHERE is_active = true' : '';

            const [result] = await sequelize.query(
                `SELECT COUNT(*)::int as count FROM "${schemaName}".users ${whereClause}`,
                { type: sequelize.QueryTypes.SELECT }
            );

            return result.count || 0;
        } catch (error) {
            console.error('Error counting users:', error);
            return 0;
        }
    }

    /**
     * Update user by ID in specified schema
     * @param {number} id - User ID
     * @param {Object} updateData - Data to update
     * @param {string} schemaName - Schema name
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<Object|null>} Updated user or null
     */
    async update(id, updateData, schemaName, transaction = null) {
        try {
            // Build SET clause dynamically
            const updates = [];
            const replacements = { id };

            if (updateData.name !== undefined) {
                updates.push('name = :name');
                replacements.name = updateData.name;
            }
            if (updateData.email !== undefined) {
                updates.push('email = :email');
                replacements.email = updateData.email;
            }
            if (updateData.password !== undefined) {
                updates.push('password_hash = :password_hash');
                replacements.password_hash = await bcrypt.hash(updateData.password, 10);
            }
            if (updateData.role !== undefined) {
                updates.push('role = :role');
                replacements.role = updateData.role;
            }
            if (updateData.is_active !== undefined) {
                updates.push('is_active = :is_active');
                replacements.is_active = updateData.is_active;
            }

            if (updates.length === 0) {
                return await this.findById(id, schemaName);
            }

            updates.push('updated_at = NOW()');

            const [result] = await sequelize.query(
                `UPDATE "${schemaName}".users 
                SET ${updates.join(', ')}
                WHERE id = :id
                RETURNING *`,
                {
                    replacements,
                    transaction
                }
            );

            return result[0] || null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete user by ID in specified schema (soft delete - sets is_active to false)
     * @param {number} id - User ID
     * @param {string} schemaName - Schema name
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async softDelete(id, schemaName, transaction = null) {
        try {
            await sequelize.query(
                `UPDATE "${schemaName}".users 
                SET is_active = false, updated_at = NOW()
                WHERE id = :id`,
                {
                    replacements: { id },
                    transaction
                }
            );

            return true;
        } catch (error) {
            console.error('Error soft deleting user:', error);
            return false;
        }
    }

    /**
     * Hard delete user by ID (permanent deletion)
     * WARNING: This permanently removes the user from the database
     * @param {number} id - User ID
     * @param {string} schemaName - Schema name
     * @param {Object} transaction - Sequelize transaction object
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async hardDelete(id, schemaName, transaction = null) {
        try {
            await sequelize.query(
                `DELETE FROM "${schemaName}".users WHERE id = :id`,
                {
                    replacements: { id },
                    transaction
                }
            );

            return true;
        } catch (error) {
            console.error('Error hard deleting user:', error);
            return false;
        }
    }

    /**
     * Verify user password
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    /**
     * Check if email exists in schema
     * @param {string} email - Email to check
     * @param {string} schemaName - Schema name
     * @param {number} [excludeId] - User ID to exclude (for update operations)
     * @returns {Promise<boolean>} True if exists
     */
    async emailExists(email, schemaName, excludeId = null) {
        try {
            const excludeClause = excludeId ? 'AND id != :excludeId' : '';
            
            const [result] = await sequelize.query(
                `SELECT COUNT(*)::int as count FROM "${schemaName}".users 
                WHERE email = :email ${excludeClause}`,
                {
                    replacements: { email, excludeId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return result.count > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    }
}

module.exports = new UserRepository();

