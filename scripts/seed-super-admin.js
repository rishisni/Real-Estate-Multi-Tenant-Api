/**
 * Seed Script: Create Initial Super Admin User
 * Run this script after running public schema migrations
 * 
 * Usage: node scripts/seed-super-admin.js
 */

const { sequelize } = require('../src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@housingram.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

async function seedSuperAdmin() {
    try {
        console.log('🌱 Starting Super Admin seed...');

        // Set search path to public
        await sequelize.query('SET search_path TO public;');

        // Check if super admin already exists
        const [existingAdmin] = await sequelize.query(
            `SELECT * FROM public.users WHERE email = :email AND role = 'Super Admin' LIMIT 1`,
            {
                replacements: { email: SUPER_ADMIN_EMAIL },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (existingAdmin) {
            console.log('✅ Super Admin user already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log('   No action taken.');
            process.exit(0);
        }

        // Hash password
        const password_hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

        // Create super admin user
        await sequelize.query(
            `INSERT INTO public.users (name, email, password_hash, role, is_active, created_at, updated_at)
            VALUES (:name, :email, :password_hash, 'Super Admin', true, NOW(), NOW())`,
            {
                replacements: {
                    name: SUPER_ADMIN_NAME,
                    email: SUPER_ADMIN_EMAIL,
                    password_hash
                }
            }
        );

        console.log('✅ Super Admin user created successfully!');
        console.log(`   Name: ${SUPER_ADMIN_NAME}`);
        console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
        console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password immediately in production!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Super Admin:', error);
        process.exit(1);
    }
}

// Execute seed
seedSuperAdmin();

