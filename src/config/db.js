// src/config/db.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, 
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
        schema: 'public' 
    }
);

/**
 * Executes a query to dynamically set the PostgreSQL search_path.
 * CRITICAL for multi-tenancy isolation.
 */
const setSchemaSearchPath = async (schemaName, transaction) => {
    // Note: We don't need a transaction object here for this simple command.
    await sequelize.query(`SET search_path TO "${schemaName}", public;`);
};

module.exports = {
    sequelize,
    setSchemaSearchPath
};