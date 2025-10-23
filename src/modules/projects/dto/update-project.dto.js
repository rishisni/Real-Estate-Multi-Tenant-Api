/**
 * Update Project DTO
 * @module modules/projects/dto/update-project
 */

class UpdateProjectDto {
    constructor(data) {
        if (data.name !== undefined) this.name = data.name;
        if (data.location !== undefined) this.location = data.location;
        if (data.description !== undefined) this.description = data.description;
        if (data.total_units !== undefined) this.total_units = data.total_units;
        if (data.status !== undefined) this.status = data.status;
        if (data.is_active !== undefined) this.is_active = data.is_active;
    }

    hasUpdates() {
        return Object.keys(this).length > 0;
    }
}

module.exports = UpdateProjectDto;

