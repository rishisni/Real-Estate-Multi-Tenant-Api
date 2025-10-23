# 📝 Winston Logging Guide - Housingram Backend

## 🎯 Overview

Winston is configured to provide comprehensive logging with multiple transports and log levels.

## 📂 Log Files Location

```
logs/
├── error.log              → Only errors (permanent record)
├── combined.log           → All log levels (permanent record)
├── application-2024-10-23.log  → Daily rotated logs (last 14 days)
├── exceptions.log         → Uncaught exceptions
└── rejections.log         → Unhandled promise rejections
```

## 📊 Log Levels

```javascript
error   → Critical errors (saved to error.log)
warn    → Warning messages
info    → General information (API starts, logins)
http    → HTTP requests (all API calls)
debug   → Debugging information (database queries in dev)
```

## 🚀 How to Use Logger

### 1. Import Logger

```javascript
const logger = require('./src/config/logger');
```

### 2. Basic Logging

```javascript
// Information
logger.info('Server started successfully');

// Warnings
logger.warn('Deprecated API endpoint used');

// Errors
logger.error('Database connection failed', { error: err.message });

// Debug (only in development)
logger.debug('Processing user data', { userId: 123 });

// HTTP (for requests)
logger.http('GET /api/users - 200 OK');
```

### 3. Structured Logging (Recommended)

```javascript
// With metadata
logger.info('User created', {
    userId: 42,
    email: 'user@example.com',
    role: 'Admin'
});

// Error with context
logger.error('Payment failed', {
    orderId: 1234,
    amount: 5000,
    error: error.message,
    stack: error.stack
});
```

### 4. Helper Methods (Pre-configured)

#### Authentication Logging
```javascript
logger.logAuth(email, success, reason, ip);

// Example
logger.logAuth('admin@example.com', true, 'Login successful', '192.168.1.1');
```

#### HTTP Request Logging (Automatic)
```javascript
// Automatically logged by requestLogger middleware
logger.logRequest(req, statusCode, responseTime);
```

#### Error Logging
```javascript
// With request context
logger.logError(error, req);

// Without request
logger.logError(error);
```

#### Database Query Logging
```javascript
logger.logDbQuery(query, duration, error);

// Success
logger.logDbQuery('SELECT * FROM users', 25);

// Error
logger.logDbQuery('SELECT * FROM users', 0, new Error('Connection timeout'));
```

## 📝 What Gets Logged Automatically

### ✅ Already Logged:
- **All HTTP Requests** → Method, URL, Status, Response Time, User
- **Authentication Attempts** → Success/Failure, Email, Reason
- **Server Startup** → Port, Environment, Database Connection
- **Errors** → All unhandled errors with stack traces
- **User Actions** → Login/Logout events

### 🔜 Add Logging For:
- **Business Operations** → User CRUD, Project CRUD, Unit bookings
- **Database Queries** → Slow queries (>100ms)
- **External API Calls** → If you integrate payment/email APIs
- **Authorization Failures** → When users try to access forbidden resources

## 🔍 How to View Logs

### 1. Console (Development)
Logs are automatically shown in the terminal with colors:
```bash
npm start
# All logs appear in console
```

### 2. Log Files

```bash
# View error logs
cat logs/error.log

# Tail combined logs (real-time)
tail -f logs/combined.log

# View today's application logs
cat logs/application-2024-10-23.log

# Search for specific error
grep "Database" logs/error.log

# View last 50 lines of errors
tail -50 logs/error.log
```

### 3. JSON Parsing (For Tools)

Log files are in JSON format for easy parsing:
```bash
# Pretty print JSON logs
cat logs/combined.log | jq '.'

# Filter by level
cat logs/combined.log | jq 'select(.level == "error")'

# Filter by timestamp
cat logs/combined.log | jq 'select(.timestamp > "2024-10-23T10:00:00")'
```

## 🎨 Log Format

### Console (Colorized)
```
2024-10-23 14:30:45 [info]: Server started on port 3000
2024-10-23 14:30:50 [http]: POST /api/v1/auth/login - 200 OK - 45ms
2024-10-23 14:31:00 [error]: Database query failed {"query":"SELECT ..."}
```

### File (JSON)
```json
{
  "timestamp": "2024-10-23 14:30:45",
  "level": "info",
  "message": "Server started on port 3000"
}

{
  "timestamp": "2024-10-23 14:31:00",
  "level": "error",
  "message": "Database query failed",
  "query": "SELECT * FROM users",
  "error": "Connection timeout"
}
```

## ⚙️ Configuration

### Change Log Level (`.env`)
```bash
# Development (shows debug logs)
NODE_ENV=development

# Production (shows only info, warn, error)
NODE_ENV=production
```

### Log Rotation Settings

Current configuration:
- **Max File Size**: 20MB (auto-rotates when exceeded)
- **Retention**: 14 days
- **Compression**: Yes (old logs are zipped)
- **Error Log**: Last 5 files (5MB each)
- **Combined Log**: Last 5 files (5MB each)

To change, edit `/src/config/logger.js`:
```javascript
new DailyRotateFile({
    maxSize: '20m',    // Change file size
    maxFiles: '14d',   // Change retention period
    zippedArchive: true // Enable/disable compression
})
```

## 🛠️ Advanced Usage

### Adding Logger to Services

```javascript
// In any service file
const logger = require('../../config/logger');

class MyService {
    async doSomething() {
        logger.info('Starting operation', { userId: 123 });
        
        try {
            // Your code
            logger.debug('Processing step 1');
            
        } catch (error) {
            logger.error('Operation failed', {
                operation: 'doSomething',
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}
```

### Custom Log Levels

```javascript
// Define in logger.js
const customLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5
};

// Use
logger.fatal('Critical system failure!');
```

## 🔒 Security Best Practices

### ✅ DO Log:
- Authentication attempts
- Authorization failures
- API requests (method, URL, status)
- Error messages
- System events

### ❌ DON'T Log:
- **Passwords** (even hashed ones)
- **JWT Tokens**
- **API Keys**
- **Credit Card Numbers**
- **Personal Identification Numbers**
- **Database Connection Strings**

### Example: Safe Logging
```javascript
// ❌ BAD
logger.info('User login', { email, password, token });

// ✅ GOOD
logger.info('User login', { email, success: true });
```

## 📈 Monitoring in Production

### 1. Check Error Logs Regularly
```bash
# Cron job to email daily error summary
0 9 * * * cat /path/to/logs/error.log | mail -s "Daily Errors" admin@example.com
```

### 2. Set Up Alerts
```bash
# Alert if error.log grows too large
watch -n 60 'ls -lh logs/error.log | awk "{if (\$5 > 10M) print \"Alert: Error log is large\"}"'
```

### 3. Integration with Log Management Tools
- **Loggly**: Centralized log management
- **Papertrail**: Real-time log aggregation
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Datadog**: Full monitoring solution

## 🧹 Maintenance

### Clean Old Logs Manually
```bash
# Delete logs older than 30 days
find logs/ -name "*.log" -mtime +30 -delete

# Delete zipped logs older than 60 days
find logs/ -name "*.gz" -mtime +60 -delete
```

### Check Log Directory Size
```bash
du -sh logs/
```

## 🚨 Troubleshooting

### Logs Not Appearing?

1. **Check if logs directory exists:**
   ```bash
   ls -la logs/
   ```

2. **Check file permissions:**
   ```bash
   chmod 755 logs/
   chmod 644 logs/*.log
   ```

3. **Check NODE_ENV:**
   ```bash
   echo $NODE_ENV
   # Should be 'development' or 'production'
   ```

4. **Verify logger import:**
   ```javascript
   const logger = require('./src/config/logger'); // ✅ Correct
   const logger = require('./config/logger');     // ❌ Wrong path
   ```

### Console Logs Not Colored?

```bash
# Check if terminal supports colors
echo $TERM

# Force color output
export FORCE_COLOR=1
```

## 📚 Quick Reference

```javascript
// Import
const logger = require('./src/config/logger');

// Basic
logger.info('Message');
logger.error('Error message');
logger.warn('Warning');
logger.debug('Debug info');
logger.http('HTTP request');

// With metadata
logger.info('Message', { key: 'value' });

// Helpers
logger.logAuth(email, success, reason, ip);
logger.logRequest(req, statusCode, responseTime);
logger.logError(error, req);
logger.logDbQuery(query, duration, error);
```

---

## 🎯 Summary

✅ **Automatic Request Logging** → Every API call is logged  
✅ **File Rotation** → Logs rotate daily, kept for 14 days  
✅ **Multiple Levels** → error, warn, info, http, debug  
✅ **Structured JSON** → Easy to parse and search  
✅ **Console Output** → Colorized for development  
✅ **Error Tracking** → All errors logged with stack traces  
✅ **Security** → No sensitive data logged  

**Your logs are saved in `./logs/` directory** 📁

