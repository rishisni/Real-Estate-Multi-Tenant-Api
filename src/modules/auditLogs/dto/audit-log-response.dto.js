/**
 * Audit Log Response DTO
 * @module modules/auditLogs/dto/audit-log-response
 */

class AuditLogResponseDto {
    constructor(log) {
        const data = log.get ? log.get({ plain: true }) : log;

        this.id = data.id;
        this.user_id = data.user_id;
        this.user_name = data.user_name;
        this.action = data.action;
        this.entity = data.entity;
        this.entity_id = data.entity_id;
        this.old_values = data.old_values;
        this.new_values = data.new_values;
        this.ip_address = data.ip_address;
        this.user_agent = data.user_agent;
        this.created_at = data.created_at;
    }

    static fromArray(logs) {
        return logs.map(log => new AuditLogResponseDto(log));
    }
}

module.exports = AuditLogResponseDto;

