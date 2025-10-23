/**
 * Audit Log Repository
 * Handles all database operations for audit logs
 * @module modules/auditLogs/repository/audit-log.repository
 */

const { sequelize } = require('../../../config/db');

class AuditLogRepository {
    async findById(id, schemaName) {
        try {
            const [results] = await sequelize.query(
                `SELECT * FROM "${schemaName}".audit_logs WHERE id = :id LIMIT 1`,
                {
                    replacements: { id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            return results || null;
        } catch (error) {
            console.error('Error finding audit log:', error);
            return null;
        }
    }

    async findAll(schemaName, options = {}) {
        try {
            const conditions = [];
            const replacements = {};

            if (options.user_id) {
                conditions.push('user_id = :user_id');
                replacements.user_id = options.user_id;
            }

            if (options.action) {
                conditions.push('action = :action');
                replacements.action = options.action;
            }

            if (options.entity) {
                conditions.push('entity = :entity');
                replacements.entity = options.entity;
            }

            if (options.entity_id) {
                conditions.push('entity_id = :entity_id');
                replacements.entity_id = options.entity_id;
            }

            if (options.start_date) {
                conditions.push('created_at >= :start_date');
                replacements.start_date = options.start_date;
            }

            if (options.end_date) {
                conditions.push('created_at <= :end_date');
                replacements.end_date = options.end_date;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
            const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

            const results = await sequelize.query(
                `SELECT * FROM "${schemaName}".audit_logs 
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
            console.error('Error finding all audit logs:', error);
            return [];
        }
    }

    async count(schemaName, options = {}) {
        try {
            const conditions = [];
            const replacements = {};

            if (options.user_id) {
                conditions.push('user_id = :user_id');
                replacements.user_id = options.user_id;
            }

            if (options.action) {
                conditions.push('action = :action');
                replacements.action = options.action;
            }

            if (options.entity) {
                conditions.push('entity = :entity');
                replacements.entity = options.entity;
            }

            if (options.entity_id) {
                conditions.push('entity_id = :entity_id');
                replacements.entity_id = options.entity_id;
            }

            if (options.start_date) {
                conditions.push('created_at >= :start_date');
                replacements.start_date = options.start_date;
            }

            if (options.end_date) {
                conditions.push('created_at <= :end_date');
                replacements.end_date = options.end_date;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const [result] = await sequelize.query(
                `SELECT COUNT(*)::int as count FROM "${schemaName}".audit_logs ${whereClause}`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return result.count || 0;
        } catch (error) {
            console.error('Error counting audit logs:', error);
            return 0;
        }
    }
}

module.exports = new AuditLogRepository();

