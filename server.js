/**
 * Housingram Backend Server
 * Multi-tenant property management system with schema-per-tenant isolation
 */

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Import logger (must be early to catch startup errors)
const logger = require('./src/config/logger');

// Import database connection
const { sequelize } = require('./src/config/db');

// Import central router
const apiRoutes = require('./src/routes/index');

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// Import logging middleware
const { requestLogger, errorLogger } = require('./src/middleware/requestLogger');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (Winston-based)
app.use(requestLogger);

// Test database connection
sequelize.authenticate()
    .then(() => {
        logger.info('✅ Database connection established successfully');
        logger.info(`📊 Connected to: ${process.env.DB_NAME}`);
    })
    .catch(err => {
        logger.error('❌ Unable to connect to the database:', { error: err.message, stack: err.stack });
        process.exit(1);
    });

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Housingram API Docs'
}));

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Housingram Multi-Tenant API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            documentation: '/api-docs',
            swagger: '/api-docs'
        }
    });
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
    // Error already logged by errorLogger middleware
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    logger.info('');
    logger.info('🚀 Housingram Backend Server Started');
    logger.info(`📡 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Base URL: http://localhost:${PORT}`);
    logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`📝 Logs directory: ./logs/`);
    logger.info('');
});