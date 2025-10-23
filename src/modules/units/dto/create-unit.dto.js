/**
 * Create Unit DTO
 * @module modules/units/dto/create-unit
 */

class CreateUnitDto {
    constructor(data) {
        this.project_id = data.project_id;
        this.unit_number = data.unit_number;
        this.floor = data.floor || null;
        this.area = data.area;
        this.bedrooms = data.bedrooms || null;
        this.bathrooms = data.bathrooms || null;
        this.price = data.price;
        this.status = 'Available'; // Always start as Available
    }
}

module.exports = CreateUnitDto;

