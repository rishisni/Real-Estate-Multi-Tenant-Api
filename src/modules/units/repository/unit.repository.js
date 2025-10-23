/**
 * Unit Repository
 * Handles all database operations for units
 * @module modules/units/repository/unit.repository
 */

const { sequelize } = require('../../../config/db');

class UnitRepository {
    async create(unitData, schemaName, transaction = null) {
        try {
            // Convert DTO instance to plain object
            const plainData = {
                project_id: unitData.project_id,
                unit_number: unitData.unit_number,
                floor: unitData.floor,
                area: unitData.area,
                bedrooms: unitData.bedrooms,
                bathrooms: unitData.bathrooms,
                price: unitData.price,
                status: unitData.status
            };

            const result = await sequelize.query(
                `INSERT INTO "${schemaName}".units 
                (project_id, unit_number, floor, area, bedrooms, bathrooms, price, status, is_active, created_at, updated_at)
                VALUES (:project_id, :unit_number, :floor, :area, :bedrooms, :bathrooms, :price, :status, true, NOW(), NOW())
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
            console.error('Error creating unit:', error);
            throw error;
        }
    }

    async findById(id, schemaName) {
        try {
            const [results] = await sequelize.query(
                `SELECT * FROM "${schemaName}".units WHERE id = :id LIMIT 1`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            return results || null;
        } catch (error) {
            console.error('Error finding unit:', error);
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

            if (options.project_id) {
                conditions.push('project_id = :project_id');
                replacements.project_id = options.project_id;
            }

            if (options.status) {
                conditions.push('status = :status');
                replacements.status = options.status;
            }

            if (options.min_price !== undefined) {
                conditions.push('price >= :min_price');
                replacements.min_price = options.min_price;
            }

            if (options.max_price !== undefined) {
                conditions.push('price <= :max_price');
                replacements.max_price = options.max_price;
            }

            if (options.bedrooms !== undefined) {
                conditions.push('bedrooms = :bedrooms');
                replacements.bedrooms = options.bedrooms;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
            const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

            const results = await sequelize.query(
                `SELECT * FROM "${schemaName}".units 
                ${whereClause}
                ORDER BY project_id, unit_number
                ${limitClause} ${offsetClause}`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return results;
        } catch (error) {
            console.error('Error finding all units:', error);
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

            if (options.project_id) {
                conditions.push('project_id = :project_id');
                replacements.project_id = options.project_id;
            }

            if (options.status) {
                conditions.push('status = :status');
                replacements.status = options.status;
            }

            if (options.min_price !== undefined) {
                conditions.push('price >= :min_price');
                replacements.min_price = options.min_price;
            }

            if (options.max_price !== undefined) {
                conditions.push('price <= :max_price');
                replacements.max_price = options.max_price;
            }

            if (options.bedrooms !== undefined) {
                conditions.push('bedrooms = :bedrooms');
                replacements.bedrooms = options.bedrooms;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const [result] = await sequelize.query(
                `SELECT COUNT(*)::int as count FROM "${schemaName}".units ${whereClause}`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return result.count || 0;
        } catch (error) {
            console.error('Error counting units:', error);
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
                `UPDATE "${schemaName}".units 
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
            console.error('Error updating unit:', error);
            throw error;
        }
    }

    async bookUnit(id, userId, schemaName, transaction = null) {
        try {
            const result = await sequelize.query(
                `UPDATE "${schemaName}".units 
                SET status = 'Booked', 
                    booked_by = :userId, 
                    booked_at = NOW(),
                    updated_at = NOW()
                WHERE id = :id AND status = 'Available'
                RETURNING *`,
                {
                    replacements: { id, userId },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );

            // With QueryTypes.UPDATE, returns [rows, affected]
            return result[0][0] || null;
        } catch (error) {
            console.error('Error booking unit:', error);
            throw error;
        }
    }

    async markAsSold(id, schemaName, transaction = null) {
        try {
            const result = await sequelize.query(
                `UPDATE "${schemaName}".units 
                SET status = 'Sold', 
                    sold_at = NOW(),
                    updated_at = NOW()
                WHERE id = :id AND status IN ('Available', 'Booked')
                RETURNING *`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );

            // With QueryTypes.UPDATE, returns [rows, affected]
            return result[0][0] || null;
        } catch (error) {
            console.error('Error marking unit as sold:', error);
            throw error;
        }
    }

    async softDelete(id, schemaName, transaction = null) {
        try {
            await sequelize.query(
                `UPDATE "${schemaName}".units 
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
            console.error('Error soft deleting unit:', error);
            return false;
        }
    }
}

module.exports = new UnitRepository();

