/**
 * Update Unit DTO
 * @module modules/units/dto/update-unit
 */

class UpdateUnitDto {
    constructor(data) {
        if (data.unit_number !== undefined) this.unit_number = data.unit_number;
        if (data.floor !== undefined) this.floor = data.floor;
        if (data.area !== undefined) this.area = data.area;
        if (data.bedrooms !== undefined) this.bedrooms = data.bedrooms;
        if (data.bathrooms !== undefined) this.bathrooms = data.bathrooms;
        if (data.price !== undefined) this.price = data.price;
        if (data.is_active !== undefined) this.is_active = data.is_active;
        // Note: status is NOT updated via this DTO - use BookUnitDto
    }

    hasUpdates() {
        return Object.keys(this).length > 0;
    }
}

module.exports = UpdateUnitDto;

