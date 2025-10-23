/**
 * Project Repository
 * Handles all database operations for projects
 * @module modules/projects/repository/project.repository
 */

const { sequelize } = require('../../../config/db');

class ProjectRepository {
    async create(projectData, schemaName, transaction = null) {
        try {
            // Convert DTO instance to plain object
            const plainData = {
                tenant_id: projectData.tenant_id,
                name: projectData.name,
                location: projectData.location,
                description: projectData.description,
                total_units: projectData.total_units,
                status: projectData.status
            };

            const result = await sequelize.query(
                `INSERT INTO "${schemaName}".projects 
                (tenant_id, name, location, description, total_units, status, is_active, created_at, updated_at)
                VALUES (:tenant_id, :name, :location, :description, :total_units, :status, true, NOW(), NOW())
                RETURNING *`,
                {
                    replacements: plainData,
                    type: sequelize.QueryTypes.INSERT,
                    transaction
                }
            );
            // With QueryTypes.INSERT, returns [rows, affected]
            return result[0][0];
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    async findById(id, schemaName) {
        try {
            const [results] = await sequelize.query(
                `SELECT * FROM "${schemaName}".projects WHERE id = :id LIMIT 1`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            return results || null;
        } catch (error) {
            console.error('Error finding project:', error);
            return null;
        }
    }

    async findAll(schemaName, options = {}) {
        try {
            const conditions = [];
            const replacements = {};

            if (options.activeOnly) {
                conditions.push('is_active = true');
            }

            if (options.status) {
                conditions.push('status = :status');
                replacements.status = options.status;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
            const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

            const results = await sequelize.query(
                `SELECT * FROM "${schemaName}".projects 
                ${whereClause}
                ORDER BY created_at DESC
                ${limitClause} ${offsetClause}`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return results;
        } catch (error) {
            console.error('Error finding all projects:', error);
            return [];
        }
    }

    async count(schemaName, options = {}) {
        try {
            const conditions = [];
            const replacements = {};

            if (options.activeOnly) {
                conditions.push('is_active = true');
            }

            if (options.status) {
                conditions.push('status = :status');
                replacements.status = options.status;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const [result] = await sequelize.query(
                `SELECT COUNT(*)::int as count FROM "${schemaName}".projects ${whereClause}`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return result.count || 0;
        } catch (error) {
            console.error('Error counting projects:', error);
            return 0;
        }
    }

    async update(id, updateData, schemaName, transaction = null) {
        try {
            const updates = [];
            const replacements = { id };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    updates.push(`${key} = :${key}`);
                    replacements[key] = updateData[key];
                }
            });

            if (updates.length === 0) {
                return await this.findById(id, schemaName);
            }

            updates.push('updated_at = NOW()');

            const result = await sequelize.query(
                `UPDATE "${schemaName}".projects 
                SET ${updates.join(', ')}
                WHERE id = :id
                RETURNING *`,
                {
                    replacements,
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );

            // With QueryTypes.UPDATE, returns [rows, affected]
            return result[0][0] || null;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    async softDelete(id, schemaName, transaction = null) {
        try {
            await sequelize.query(
                `UPDATE "${schemaName}".projects 
                SET is_active = false, updated_at = NOW()
                WHERE id = :id`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );
            return true;
        } catch (error) {
            console.error('Error soft deleting project:', error);
            return false;
        }
    }
}

module.exports = new ProjectRepository();

