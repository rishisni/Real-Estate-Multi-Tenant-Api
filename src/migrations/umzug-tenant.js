/**
 * Umzug Migration Runner for Tenant Schemas
 * Manages migrations for tenant-specific schemas
 * Can run migrations on a specific tenant schema or all tenant schemas
 * 
 * Usage:
 *   node src/migrations/umzug-tenant.js up <schema_name>   - Run migrations on specific tenant
 *   node src/migrations/umzug-tenant.js up all             - Run migrations on all tenants
 *   node src/migrations/umzug-tenant.js down <schema_name> - Rollback on specific tenant
 */

const { Umzug, SequelizeStorage } = require('umzug');
const { sequelize } = require('../config/db');
const { getAllTenantSchemas } = require('../utils/schemaManager');
const path = require('path');

/**
 * Create Umzug instance for a specific tenant schema
 * @param {string} schemaName - Tenant schema name
 * @returns {Umzug} Configured Umzug instance
 */
const createTenantUmzug = (schemaName) => {
    return new Umzug({
        migrations: {
            glob: path.join(__dirname, 'tenant', '*.js'),
            resolve: ({ name, path: migrationPath, context }) => {
                const migration = require(migrationPath);
                return {
                    name,
                    up: async () => migration.up(context, sequelize.QueryInterface, schemaName),
                    down: async () => migration.down(context, sequelize.QueryInterface, schemaName)
                };
            }
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({
            sequelize,
            tableName: 'migrations',
            schema: schemaName
        }),
        logger: console
    });
};

/**
 * Run migrations on a specific tenant schema
 * @param {string} schemaName - Tenant schema name
 * @param {string} direction - 'up' or 'down'
 */
const runTenantMigration = async (schemaName, direction = 'up') => {
    console.log(`\n[${schemaName}] Setting search path...`);
    await sequelize.query(`SET search_path TO "${schemaName}", public;`);

    const umzug = createTenantUmzug(schemaName);

    if (direction === 'up') {
        console.log(`[${schemaName}] Running pending migrations...`);
        const migrations = await umzug.up();
        console.log(`[${schemaName}] Executed ${migrations.length} migration(s)`);
        migrations.forEach(m => console.log(`  - ${m.name}`));
    } else if (direction === 'down') {
        console.log(`[${schemaName}] Rolling back last migration...`);
        const migrations = await umzug.down();
        console.log(`[${schemaName}] Rolled back ${migrations.length} migration(s)`);
        migrations.forEach(m => console.log(`  - ${m.name}`));
    }
};

/**
 * Run migrations based on command line arguments
 */
const runMigrations = async () => {
    try {
        const command = process.argv[2] || 'up'; // up or down
        const target = process.argv[3]; // schema name or 'all'

        if (!target) {
            console.error('Please specify a tenant schema name or "all"');
            console.error('Usage: node src/migrations/umzug-tenant.js [up|down] [schema_name|all]');
            process.exit(1);
        }

        if (target === 'all') {
            const schemas = await getAllTenantSchemas();
            console.log(`Found ${schemas.length} tenant schema(s)`);

            for (const schema of schemas) {
                await runTenantMigration(schema, command);
            }
        } else {
            await runTenantMigration(target, command);
        }

        // Reset search path
        await sequelize.query('SET search_path TO public;');
        console.log('\nTenant migration(s) completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

// Execute if run directly
if (require.main === module) {
    runMigrations();
}

module.exports = { createTenantUmzug, runTenantMigration };

