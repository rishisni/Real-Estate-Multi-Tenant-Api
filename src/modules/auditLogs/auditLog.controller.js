/**
 * Audit Log Controller
 * Handles HTTP requests for audit log retrieval
 * @module modules/auditLogs/auditLog.controller
 */

const auditLogService = require('./auditLog.service');
const { sendSuccess, sendError } = require('../../utils/response');
const { NotFoundError } = require('../../utils/errors');

class AuditLogController {
    async getAllLogs(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                user_id: req.query.user_id,
                action: req.query.action,
                entity: req.query.entity,
                entity_id: req.query.entity_id,
                start_date: req.query.start_date,
                end_date: req.query.end_date
            };

            const result = await auditLogService.getAllLogs(req.tenantSchema, options);
            return sendSuccess(res, result, 'Audit logs retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    async getLogById(req, res) {
        try {
            const log = await auditLogService.getLogById(req.params.id, req.tenantSchema);
            return sendSuccess(res, log, 'Audit log retrieved successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }
}

module.exports = new AuditLogController();

