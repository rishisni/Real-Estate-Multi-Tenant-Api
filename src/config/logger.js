/**
 * Winston Logger Configuration
 * 
 * Provides centralized logging with multiple transports:
 * - Console (development with colors)
 * - File (errors only)
 * - File (all logs combined)
 * - Daily Rotate File (with automatic cleanup)
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Custom format for console (colorized and readable)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

// Create transports array
const transports = [
    // Console transport (always enabled)
    new winston.transports.Console({
        format: consoleFormat,
    }),

    // Error log file (only errors)
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Combined log file (all logs)
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Daily rotate file transport (keeps last 14 days)
    new DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true, // Compress old logs
        maxSize: '20m', // Rotate if file exceeds 20MB
        maxFiles: '14d', // Keep logs for 14 days
        format: logFormat,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
    exitOnError: false, // Don't exit on handled exceptions
});

// Handle uncaught exceptions
logger.exceptions.handle(
    new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
        format: logFormat,
    })
);

// Handle unhandled promise rejections
logger.rejections.handle(
    new winston.transports.File({
        filename: path.join(logsDir, 'rejections.log'),
        format: logFormat,
    })
);

// Create a stream object for Morgan (HTTP request logging)
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

// Helper methods for structured logging
logger.logRequest = (req, statusCode, responseTime) => {
    logger.http('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('user-agent'),
        user: req.user ? req.user.email : 'anonymous',
    });
};

logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        code: error.code || 'INTERNAL_ERROR',
    };

    if (req) {
        errorLog.method = req.method;
        errorLog.url = req.originalUrl;
        errorLog.ip = req.ip || req.connection.remoteAddress;
        errorLog.user = req.user ? req.user.email : 'anonymous';
    }

    logger.error('Application Error', errorLog);
};

logger.logAuth = (email, success, reason, ip) => {
    logger.info('Authentication Attempt', {
        email,
        success,
        reason,
        ip,
    });
};

logger.logDbQuery = (query, duration, error = null) => {
    if (error) {
        logger.error('Database Query Failed', {
            query,
            duration: `${duration}ms`,
            error: error.message,
        });
    } else {
        logger.debug('Database Query', {
            query,
            duration: `${duration}ms`,
        });
    }
};

module.exports = logger;

