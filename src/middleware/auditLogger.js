/**
 * Audit Logger Middleware
 * Automatically logs all CREATE, UPDATE, DELETE operations to the audit_logs table
 * @module middleware/auditLogger
 */

const { sequelize } = require('../config/db');

/**
 * Create an audit log entry in the specified tenant schema
 * @param {Object} logData - Audit log data containing user, action, entity information
 * @param {string} schemaName - Tenant schema name where the log will be stored
 * @returns {Promise<void>}
 */
const createAuditLog = async (logData, schemaName) => {
    try {
        // Ensure we're in the correct schema
        await sequelize.query(`SET search_path TO "${schemaName}", public;`);

        // Insert audit log
        await sequelize.query(
            `INSERT INTO "${schemaName}".audit_logs 
            (user_id, user_name, action, entity, entity_id, old_values, new_values, ip_address, user_agent, created_at)
            VALUES (:user_id, :user_name, :action, :entity, :entity_id, :old_values, :new_values, :ip_address, :user_agent, NOW())`,
            {
                replacements: {
                    user_id: logData.userId,
                    user_name: logData.userName,
                    action: logData.action,
                    entity: logData.entity,
                    entity_id: logData.entityId,
                    old_values: logData.oldValues ? JSON.stringify(logData.oldValues) : null,
                    new_values: logData.newValues ? JSON.stringify(logData.newValues) : null,
                    ip_address: logData.ipAddress,
                    user_agent: logData.userAgent
                },
                type: sequelize.QueryTypes.INSERT
            }
        );
    } catch (error) {
        // Log error but don't fail the request - audit logging should not break the main flow
        console.error('Failed to create audit log:', error.message);
    }
};

/**
 * Middleware factory to create audit logs for specific actions
 * This should be placed as the LAST middleware after the controller
 * 
 * @param {string} entity - Entity type (e.g., 'project', 'unit', 'user')
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, BOOK, etc.)
 * @returns {Function} Express middleware function
 * 
 * Usage: Store audit data on res.locals in controller before sending response
 * 
 * @example
 * // In controller:
 * res.locals.auditData = { entityId: project.id, newValues: project };
 * 
 * // In route:
 * router.post('/projects', authenticateToken, tenantResolver,
 *   projectController.create, auditLog('project', 'CREATE'));
 */
const auditLog = (entity, action) => {
    return async (req, res, next) => {
        // Only log for tenant users (not Super Admins operating in public schema)
        if (!req.user || !req.tenantSchema || req.user.role === 'Super Admin') {
            return;
        }

        try {
            const auditData = res.locals.auditData || {};

            // Extract IP address
            const ipAddress = req.ip || 
                            req.headers['x-forwarded-for']?.split(',')[0] || 
                            req.connection.remoteAddress;

            const logData = {
                userId: req.user.id,
                userName: req.user.name || req.user.email,
                action: action,
                entity: entity,
                entityId: auditData.entityId,
                oldValues: auditData.oldValues || null,
                newValues: auditData.newValues || null,
                ipAddress: ipAddress,
                userAgent: req.headers['user-agent'] || null
            };

            // Create audit log asynchronously (don't block response)
            setImmediate(() => {
                createAuditLog(logData, req.tenantSchema);
            });

        } catch (error) {
            // Log error but don't fail the request
            console.error('Audit logging error:', error.message);
        }

        // Don't call next() - audit logger is the last middleware
    };
};

/**
 * Helper function to capture old values before update/delete operations
 * Use this in controllers before modifying data
 * 
 * @param {Object} entity - The entity object with current values
 * @returns {Object} Plain object with current values
 * 
 * @example
 * // In controller before update:
 * const oldValues = captureOldValues(project);
 * await project.update(newData);
 * res.locals.auditData = {
 *   entityId: project.id,
 *   oldValues: oldValues,
 *   newValues: project
 * };
 */
const captureOldValues = (entity) => {
    if (!entity) return null;
    
    // If it's a Sequelize model instance, get plain values
    if (entity.get && typeof entity.get === 'function') {
        return entity.get({ plain: true });
    }
    
    // Otherwise, return a copy of the object
    return { ...entity };
};

module.exports = {
    auditLog,
    captureOldValues,
    createAuditLog
};

