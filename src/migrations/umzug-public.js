/**
 * Umzug Migration Runner for Public Schema
 * Manages migrations for the public schema (tenants table, super admin users)
 * 
 * Usage:
 *   node src/migrations/umzug-public.js up    - Run pending migrations
 *   node src/migrations/umzug-public.js down  - Rollback last migration
 */

const { Umzug, SequelizeStorage } = require('umzug');
const { sequelize } = require('../config/db');
const path = require('path');

/**
 * Configure Umzug for public schema migrations
 */
const umzug = new Umzug({
    migrations: {
        glob: path.join(__dirname, 'public', '*.js'),
        resolve: ({ name, path: migrationPath, context }) => {
            const migration = require(migrationPath);
            return {
                name,
                up: async () => migration.up(context, sequelize.QueryInterface),
                down: async () => migration.down(context, sequelize.QueryInterface)
            };
        }
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
        sequelize,
        tableName: 'migrations',
        schema: 'public'
    }),
    logger: console
});

/**
 * Run migrations based on command line argument
 */
const runMigrations = async () => {
    try {
        const command = process.argv[2] || 'up';

        console.log('Setting search path to public schema...');
        await sequelize.query('SET search_path TO public;');

        if (command === 'up') {
            console.log('Running pending public schema migrations...');
            const migrations = await umzug.up();
            console.log(`Executed ${migrations.length} migration(s)`);
            migrations.forEach(m => console.log(`  - ${m.name}`));
        } else if (command === 'down') {
            console.log('Rolling back last public schema migration...');
            const migrations = await umzug.down();
            console.log(`Rolled back ${migrations.length} migration(s)`);
            migrations.forEach(m => console.log(`  - ${m.name}`));
        } else {
            console.error('Unknown command. Use "up" or "down"');
            process.exit(1);
        }

        console.log('Public schema migration completed successfully');
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

module.exports = umzug;

