/**
 * Unit Response DTO
 * @module modules/units/dto/unit-response
 */

class UnitResponseDto {
    constructor(unit) {
        const data = unit.get ? unit.get({ plain: true }) : unit;

        this.id = data.id;
        this.project_id = data.project_id;
        this.unit_number = data.unit_number;
        this.floor = data.floor;
        this.area = data.area;
        this.bedrooms = data.bedrooms;
        this.bathrooms = data.bathrooms;
        this.price = data.price;
        this.status = data.status;
        this.booked_by = data.booked_by;
        this.booked_at = data.booked_at;
        this.sold_at = data.sold_at;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static fromArray(units) {
        return units.map(unit => new UnitResponseDto(unit));
    }
}

module.exports = UnitResponseDto;

