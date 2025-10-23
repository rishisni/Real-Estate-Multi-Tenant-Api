/**
 * Fix Database Script
 * Drops old tables and recreates them with proper schema
 */

const { sequelize } = require('../src/config/db');
require('dotenv').config();

async function fixDatabase() {
    try {
        console.log('🔧 Fixing database schema...\n');

        // Set to public schema
        await sequelize.query('SET search_path TO public;');

        // Drop old tables if they exist
        console.log('Dropping old tables...');
        await sequelize.query('DROP TABLE IF EXISTS public.users CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS public.tenants CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS public.migrations CASCADE;');
        
        console.log('✅ Old tables dropped\n');

        console.log('✅ Database cleaned!');
        console.log('\nNow run:');
        console.log('  npm run migrate:public');
        console.log('  npm run seed:super-admin');
        console.log('  npm start');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDatabase();

