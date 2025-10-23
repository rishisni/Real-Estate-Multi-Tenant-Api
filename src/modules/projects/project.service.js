/**
 * Project Service
 * Contains business logic for project management
 * @module modules/projects/project.service
 */

const projectRepository = require('./repository/project.repository');
const CreateProjectDto = require('./dto/create-project.dto');
const UpdateProjectDto = require('./dto/update-project.dto');
const ProjectResponseDto = require('./dto/project-response.dto');
const { NotFoundError } = require('../../utils/errors');

class ProjectService {
    async createProject(dto, schemaName) {
        const project = await projectRepository.create(dto, schemaName);
        return new ProjectResponseDto(project);
    }

    async getAllProjects(schemaName, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        const projects = await projectRepository.findAll(schemaName, {
            activeOnly: options.activeOnly,
            status: options.status,
            limit,
            offset
        });

        const total = await projectRepository.count(schemaName, {
            activeOnly: options.activeOnly,
            status: options.status
        });

        return {
            projects: ProjectResponseDto.fromArray(projects),
            total,
            page,
            limit
        };
    }

    async getProjectById(id, schemaName) {
        const project = await projectRepository.findById(id, schemaName);

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        return new ProjectResponseDto(project);
    }

    async updateProject(id, dto, schemaName) {
        const existingProject = await projectRepository.findById(id, schemaName);

        if (!existingProject) {
            throw new NotFoundError('Project not found');
        }

        if (!dto.hasUpdates()) {
            return new ProjectResponseDto(existingProject);
        }

        const updatedProject = await projectRepository.update(id, dto, schemaName);
        return new ProjectResponseDto(updatedProject);
    }

    async deleteProject(id, schemaName) {
        const project = await projectRepository.findById(id, schemaName);

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        await projectRepository.softDelete(id, schemaName);
    }
}

module.exports = new ProjectService();

