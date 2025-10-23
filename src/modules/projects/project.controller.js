/**
 * Project Controller
 * Handles HTTP requests for project management
 * @module modules/projects/project.controller
 */

const projectService = require('./project.service');
const CreateProjectDto = require('./dto/create-project.dto');
const UpdateProjectDto = require('./dto/update-project.dto');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response');
const { NotFoundError } = require('../../utils/errors');

class ProjectController {
    async createProject(req, res, next) {
        try {
            const dto = new CreateProjectDto(req.body, req.tenantId);
            const project = await projectService.createProject(dto, req.tenantSchema);

            res.locals.auditData = {
                entityId: project.id,
                newValues: project
            };

            sendCreated(res, project, 'Project created successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    async getAllProjects(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                activeOnly: req.query.activeOnly === 'true',
                status: req.query.status
            };

            const result = await projectService.getAllProjects(req.tenantSchema, options);
            return sendSuccess(res, result, 'Projects retrieved successfully');
        } catch (error) {
            return sendError(res, error, 500);
        }
    }

    async getProjectById(req, res) {
        try {
            const project = await projectService.getProjectById(req.params.id, req.tenantSchema);
            return sendSuccess(res, project, 'Project retrieved successfully');
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    async updateProject(req, res, next) {
        try {
            const oldProject = await projectService.getProjectById(req.params.id, req.tenantSchema);
            const dto = new UpdateProjectDto(req.body);
            const project = await projectService.updateProject(req.params.id, dto, req.tenantSchema);

            res.locals.auditData = {
                entityId: project.id,
                oldValues: oldProject,
                newValues: project
            };

            sendSuccess(res, project, 'Project updated successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }

    async deleteProject(req, res, next) {
        try {
            const oldProject = await projectService.getProjectById(req.params.id, req.tenantSchema);

            await projectService.deleteProject(req.params.id, req.tenantSchema);

            res.locals.auditData = {
                entityId: req.params.id,
                oldValues: oldProject
            };

            sendSuccess(res, null, 'Project deleted successfully');
            next(); // Allow audit middleware to run
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, error, 404);
            }
            return sendError(res, error, 500);
        }
    }
}

module.exports = new ProjectController();

