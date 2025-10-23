/**
 * Audit Log Service
 * Contains business logic for audit log retrieval
 * @module modules/auditLogs/auditLog.service
 */

const auditLogRepository = require('./repository/audit-log.repository');
const AuditLogResponseDto = require('./dto/audit-log-response.dto');
const { NotFoundError } = require('../../utils/errors');

class AuditLogService {
    async getAllLogs(schemaName, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const offset = (page - 1) * limit;

        const logs = await auditLogRepository.findAll(schemaName, {
            user_id: options.user_id,
            action: options.action,
            entity: options.entity,
            entity_id: options.entity_id,
            start_date: options.start_date,
            end_date: options.end_date,
            limit,
            offset
        });

        const total = await auditLogRepository.count(schemaName, {
            user_id: options.user_id,
            action: options.action,
            entity: options.entity,
            entity_id: options.entity_id,
            start_date: options.start_date,
            end_date: options.end_date
        });

        return {
            logs: AuditLogResponseDto.fromArray(logs),
            total,
            page,
            limit
        };
    }

    async getLogById(id, schemaName) {
        const log = await auditLogRepository.findById(id, schemaName);

        if (!log) {
            throw new NotFoundError('Audit log not found');
        }

        return new AuditLogResponseDto(log);
    }
}

module.exports = new AuditLogService();

