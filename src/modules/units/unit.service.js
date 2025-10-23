/**
 * Unit Service
 * Contains business logic for unit management and booking
 * @module modules/units/unit.service
 */

const unitRepository = require('./repository/unit.repository');
const CreateUnitDto = require('./dto/create-unit.dto');
const UpdateUnitDto = require('./dto/update-unit.dto');
const UnitResponseDto = require('./dto/unit-response.dto');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

class UnitService {
    async createUnit(dto, schemaName) {
        const unit = await unitRepository.create(dto, schemaName);
        return new UnitResponseDto(unit);
    }

    async getAllUnits(schemaName, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const units = await unitRepository.findAll(schemaName, {
            activeOnly: options.activeOnly,
            project_id: options.project_id,
            status: options.status,
            min_price: options.min_price,
            max_price: options.max_price,
            bedrooms: options.bedrooms,
            limit,
            offset
        });

        const total = await unitRepository.count(schemaName, {
            activeOnly: options.activeOnly,
            project_id: options.project_id,
            status: options.status,
            min_price: options.min_price,
            max_price: options.max_price,
            bedrooms: options.bedrooms
        });

        return {
            units: UnitResponseDto.fromArray(units),
            total,
            page,
            limit
        };
    }

    async getUnitById(id, schemaName) {
        const unit = await unitRepository.findById(id, schemaName);

        if (!unit) {
            throw new NotFoundError('Unit not found');
        }

        return new UnitResponseDto(unit);
    }

    async updateUnit(id, dto, schemaName) {
        const existingUnit = await unitRepository.findById(id, schemaName);

        if (!existingUnit) {
            throw new NotFoundError('Unit not found');
        }

        if (!dto.hasUpdates()) {
            return new UnitResponseDto(existingUnit);
        }

        const updatedUnit = await unitRepository.update(id, dto, schemaName);
        return new UnitResponseDto(updatedUnit);
    }

    async bookUnit(id, userId, schemaName) {
        const unit = await unitRepository.findById(id, schemaName);

        if (!unit) {
            throw new NotFoundError('Unit not found');
        }

        if (unit.status !== 'Available') {
            throw new BadRequestError(`Unit is ${unit.status} and cannot be booked`);
        }

        const bookedUnit = await unitRepository.bookUnit(id, userId, schemaName);

        if (!bookedUnit) {
            throw new BadRequestError('Failed to book unit. It may have been booked by someone else.');
        }

        return new UnitResponseDto(bookedUnit);
    }

    async markAsSold(id, schemaName) {
        const unit = await unitRepository.findById(id, schemaName);

        if (!unit) {
            throw new NotFoundError('Unit not found');
        }

        if (unit.status === 'Sold') {
            return new UnitResponseDto(unit);
        }

        const soldUnit = await unitRepository.markAsSold(id, schemaName);

        if (!soldUnit) {
            throw new BadRequestError('Failed to mark unit as sold');
        }

        return new UnitResponseDto(soldUnit);
    }

    async deleteUnit(id, schemaName) {
        const unit = await unitRepository.findById(id, schemaName);

        if (!unit) {
            throw new NotFoundError('Unit not found');
        }

        await unitRepository.softDelete(id, schemaName);
    }
}

module.exports = new UnitService();

