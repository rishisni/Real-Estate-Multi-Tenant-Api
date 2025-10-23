/**
 * Book Unit DTO
 * @module modules/units/dto/book-unit
 */

class BookUnitDto {
    constructor(data, userId) {
        this.unit_id = data.unit_id;
        this.user_id = userId;
        this.action = data.action || 'book'; // 'book' or 'sell'
    }

    isBooking() {
        return this.action === 'book';
    }

    isSelling() {
        return this.action === 'sell';
    }
}

module.exports = BookUnitDto;

