/**
 * Unit Controller
 * Handles HTTP requests for unit management
 * @module modules/units/unit.controller
 */

const unitService = require('./unit.service');
const CreateUnitDto = require('./dto/create-unit.dto');
const UpdateUnitDto = require('./dto/update-unit.dto');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

class UnitController {
    async createUnit(req, res, next) {
        try {
            const dto = new CreateUnitDto(req.body);
            const unit = await unitService.createUnit(dto, req.tenantSchema);

            res.locals.auditData = {
                entityId: unit.id,
                newValues: unit
            };

            sendCreated(res, unit, 'Unit created successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    async getAllUnits(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                activeOnly: req.query.activeOnly === 'true',
                project_id: req.query.project_id,
                status: req.query.status,
                min_price: req.query.min_price,
                max_price: req.query.max_price,
                bedrooms: req.query.bedrooms
            };

            const result = await unitService.getAllUnits(req.tenantSchema, options);
            return sendSuccess(res, result, 'Units retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    async getUnitById(req, res) {
        try {
            const unit = await unitService.getUnitById(req.params.id, req.tenantSchema);
            return sendSuccess(res, unit, 'Unit retrieved successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    async updateUnit(req, res, next) {
        try {
            const oldUnit = await unitService.getUnitById(req.params.id, req.tenantSchema);
            const dto = new UpdateUnitDto(req.body);
            const unit = await unitService.updateUnit(req.params.id, dto, req.tenantSchema);

            res.locals.auditData = {
                entityId: unit.id,
                oldValues: oldUnit,
                newValues: unit
            };

            sendSuccess(res, unit, 'Unit updated successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    async bookUnit(req, res, next) {
        try {
            const oldUnit = await unitService.getUnitById(req.params.id, req.tenantSchema);
            const unit = await unitService.bookUnit(req.params.id, req.user.id, req.tenantSchema);

            res.locals.auditData = {
                entityId: unit.id,
                oldValues: oldUnit,
                newValues: unit
            };

            sendSuccess(res, unit, 'Unit booked successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            } else if (error instanceof BadRequestError) {
                return sendError(res, error, 400);
            }
            return sendError(res, error, 500);
        }
    }

    async deleteUnit(req, res, next) {
        try {
            const oldUnit = await unitService.getUnitById(req.params.id, req.tenantSchema);

            await unitService.deleteUnit(req.params.id, req.tenantSchema);

            res.locals.auditData = {
                entityId: req.params.id,
                oldValues: oldUnit
            };

            sendSuccess(res, null, 'Unit deleted successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }
}

module.exports = new UnitController();

