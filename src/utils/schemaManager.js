/**
 * Schema Manager Utility
 * Handles creation and management of tenant-specific database schemas
 * @module utils/schemaManager
 */

const { sequelize } = require('../config/db');
const { InternalServerError } = require('./errors');

/**
 * Generate schema name for a tenant
 * @param {number} tenantId - Tenant ID
 * @returns {string} Schema name
 */
const generateSchemaName = (tenantId) => {
    return `tenant_${tenantId}`;
};

/**
 * Create a new schema for a tenant
 * @param {string} schemaName - Name of the schema to create
 * @returns {Promise<void>}
 * @throws {InternalServerError} If schema creation fails
 */
const createSchema = async (schemaName) => {
    try {
        await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        console.log(`Schema "${schemaName}" created successfully`);
    } catch (error) {
        console.error(`Failed to create schema "${schemaName}":`, error);
        throw new InternalServerError(`Failed to create tenant schema: ${error.message}`);
    }
};

/**
 * Drop a schema and all its contents
 * WARNING: This will delete all data in the schema
 * @param {string} schemaName - Name of the schema to drop
 * @returns {Promise<void>}
 * @throws {InternalServerError} If schema deletion fails
 */
const dropSchema = async (schemaName) => {
    try {
        await sequelize.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
        console.log(`Schema "${schemaName}" dropped successfully`);
    } catch (error) {
        console.error(`Failed to drop schema "${schemaName}":`, error);
        throw new InternalServerError(`Failed to drop tenant schema: ${error.message}`);
    }
};

/**
 * Check if a schema exists
 * @param {string} schemaName - Name of the schema to check
 * @returns {Promise<boolean>} True if schema exists, false otherwise
 */
const schemaExists = async (schemaName) => {
    try {
        const [results] = await sequelize.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = :schemaName`,
            {
                replacements: { schemaName },
                type: sequelize.QueryTypes.SELECT
            }
        );
        return !!results;
    } catch (error) {
        console.error(`Failed to check schema existence for "${schemaName}":`, error);
        return false;
    }
};

/**
 * Set the search path to a specific schema
 * This determines which schema Sequelize will use for subsequent queries
 * @param {string} schemaName - Schema name to set in search path
 * @returns {Promise<void>}
 */
const setSearchPath = async (schemaName) => {
    try {
        await sequelize.query(`SET search_path TO "${schemaName}", public;`);
    } catch (error) {
        console.error(`Failed to set search path to "${schemaName}":`, error);
        throw new InternalServerError(`Failed to set schema context: ${error.message}`);
    }
};

/**
 * Reset search path to default (public)
 * @returns {Promise<void>}
 */
const resetSearchPath = async () => {
    try {
        await sequelize.query(`SET search_path TO public;`);
    } catch (error) {
        console.error('Failed to reset search path:', error);
        throw new InternalServerError('Failed to reset schema context');
    }
};

/**
 * Get all tenant schemas
 * @returns {Promise<string[]>} Array of tenant schema names
 */
const getAllTenantSchemas = async () => {
    try {
        const [results] = await sequelize.query(
            `SELECT schema_name FROM information_schema.schemata 
             WHERE schema_name LIKE 'tenant_%' 
             ORDER BY schema_name`,
            { type: sequelize.QueryTypes.SELECT }
        );
        return results.map(r => r.schema_name);
    } catch (error) {
        console.error('Failed to get tenant schemas:', error);
        return [];
    }
};

module.exports = {
    generateSchemaName,
    createSchema,
    dropSchema,
    schemaExists,
    setSearchPath,
    resetSearchPath,
    getAllTenantSchemas
};

