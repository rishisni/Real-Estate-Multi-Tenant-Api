/**
 * Project Response DTO
 * @module modules/projects/dto/project-response
 */

class ProjectResponseDto {
    constructor(project) {
        const data = project.get ? project.get({ plain: true }) : project;

        this.id = data.id;
        this.tenant_id = data.tenant_id;
        this.name = data.name;
        this.location = data.location;
        this.description = data.description;
        this.total_units = data.total_units;
        this.status = data.status;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static fromArray(projects) {
        return projects.map(project => new ProjectResponseDto(project));
    }
}

module.exports = ProjectResponseDto;

