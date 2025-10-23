/**
 * Create Project DTO
 * @module modules/projects/dto/create-project
 */

class CreateProjectDto {
    constructor(data, tenantId) {
        this.tenant_id = tenantId;
        this.name = data.name;
        this.location = data.location;
        this.description = data.description || null;
        this.total_units = data.total_units || 0;
        this.status = data.status || 'Planning';
    }
}

module.exports = CreateProjectDto;

