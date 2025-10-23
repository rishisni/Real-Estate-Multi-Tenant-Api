# Deployment Guide

This guide provides instructions for deploying the Housingram Backend API using Docker and various cloud platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Docker Deployment](#local-docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Cloud Platform Deployment](#cloud-platform-deployment)
  - [Railway](#railway)
  - [Render](#render)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
- [Production Checklist](#production-checklist)
- [Monitoring and Logs](#monitoring-and-logs)

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15+ (for non-Docker deployments)
- Node.js 18+ (for non-Docker deployments)
- Git

## Local Docker Deployment

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd housingram-backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Configuration](#environment-configuration))

3. **Build and start services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   # Run public schema migrations
   docker-compose exec app npm run migrate:public
   
   # Seed super admin user
   docker-compose exec app npm run seed:super-admin
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/api/health
   - API Documentation: http://localhost:3000/api-docs

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build

# Access app container shell
docker-compose exec app sh

# Stop and remove volumes (⚠️ WARNING: Deletes database data)
docker-compose down -v
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=housingram_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRY=24h
```

### Important Notes

- **JWT_SECRET**: Must be a strong, random string (minimum 32 characters). Generate using:
  ```bash
  openssl rand -base64 32
  ```
- **DB_PASSWORD**: Use a strong password in production
- **DB_HOST**: Set to `db` for Docker deployments, or your database host for cloud deployments

## Database Migrations

### Run Migrations

```bash
# For Docker deployment
docker-compose exec app npm run migrate:public
docker-compose exec app npm run migrate:tenant tenant_schema_name

# For non-Docker deployment
npm run migrate:public
npm run migrate:tenant tenant_schema_name
```

### Seed Super Admin

```bash
# For Docker deployment
docker-compose exec app npm run seed:super-admin

# For non-Docker deployment
npm run seed:super-admin
```

Default super admin credentials:
- Email: `superadmin@housingram.com`
- Password: `SuperAdmin@123`

**⚠️ Important**: Change the super admin password immediately after first login.

## Cloud Platform Deployment

### Railway

Railway offers the easiest deployment with automatic builds and free tier.

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL database**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create `DATABASE_URL` variable

4. **Configure environment variables**
   - Go to your app service → "Variables"
   - Add the following:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=<your-secret-key>
     JWT_EXPIRY=24h
     ```
   - Database variables are automatically set from PostgreSQL service

5. **Set start command**
   - Go to "Settings" → "Deploy"
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`

6. **Run migrations**
   - After first deployment, open the service shell
   - Run:
     ```bash
     npm run migrate:public
     npm run seed:super-admin
     ```

7. **Access your application**
   - Railway provides a public URL (e.g., `https://your-app.up.railway.app`)

### Render

Render provides free tier with auto-deploy from Git.

1. **Create a Render account** at [render.com](https://render.com)

2. **Create PostgreSQL database**
   - Dashboard → "New +" → "PostgreSQL"
   - Choose free tier
   - Note the "Internal Database URL"

3. **Create Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: housingram-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add environment variables**
   - In Web Service settings → "Environment"
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=<internal-database-url>
     JWT_SECRET=<your-secret-key>
     JWT_EXPIRY=24h
     ```

5. **Run migrations**
   - After first deployment, use Render shell
   - Run:
     ```bash
     npm run migrate:public
     npm run seed:super-admin
     ```

6. **Access your application**
   - Render provides a URL (e.g., `https://your-app.onrender.com`)

### DigitalOcean App Platform

DigitalOcean App Platform offers scalable hosting with managed database.

1. **Create DigitalOcean account** at [digitalocean.com](https://digitalocean.com)

2. **Create managed PostgreSQL database**
   - Databases → "Create Database Cluster"
   - Choose PostgreSQL 15
   - Select plan (Basic $15/month recommended)

3. **Create App**
   - Apps → "Create App"
   - Connect your GitHub repository
   - Choose branch (main/master)

4. **Configure App**
   - **Name**: housingram-api
   - **Type**: Web Service
   - **Environment**: Node.js
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

5. **Attach Database**
   - In App settings → "Components"
   - Click database component
   - Attach your PostgreSQL database

6. **Set environment variables**
   - App Settings → "App-Level Environment Variables"
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=<your-secret-key>
     JWT_EXPIRY=24h
     ```
   - Database variables are auto-injected from attached database

7. **Deploy**
   - Click "Save" and wait for deployment
   - Run migrations via console or during first request

## Production Checklist

Before deploying to production, ensure:

### Security

- [ ] Change default super admin password
- [ ] Use strong, randomly generated JWT_SECRET (min 32 characters)
- [ ] Use strong database password
- [ ] Enable HTTPS (most cloud platforms provide this automatically)
- [ ] Set NODE_ENV to `production`
- [ ] Review and update CORS settings if needed
- [ ] Disable any debug/development endpoints

### Database

- [ ] Run all migrations successfully
- [ ] Verify database backups are configured
- [ ] Ensure database connection pooling is optimized
- [ ] Test database connection from application

### Application

- [ ] Test all API endpoints
- [ ] Verify authentication and authorization
- [ ] Check health endpoint returns 200
- [ ] Verify Swagger documentation is accessible
- [ ] Test Postman collection against deployed API
- [ ] Ensure log rotation is working
- [ ] Verify audit logs are being created

### Monitoring

- [ ] Set up application monitoring (e.g., via cloud platform)
- [ ] Configure log aggregation
- [ ] Set up error tracking (optional: Sentry, Rollbar)
- [ ] Configure uptime monitoring
- [ ] Set up database performance monitoring

## Monitoring and Logs

### Application Logs

Logs are stored in the `logs/` directory:

- `error.log` - Error logs only
- `combined.log` - All logs
- `application-YYYY-MM-DD.log` - Daily application logs

**Docker**: Access logs via:
```bash
docker-compose logs -f app
```

**Cloud Platforms**: Use platform-specific log viewers or connect to external log services.

### Health Check

Monitor application health via the health endpoint:

```bash
curl http://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-23T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Database Monitoring

- Monitor connection pool usage
- Watch for slow queries
- Set up alerts for connection failures
- Regular backup verification

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if port is already in use
lsof -i :3000

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Database connection errors

- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are correct
- Ensure database service is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`

### Migration failures

- Ensure database is running and accessible
- Check migration file syntax
- Verify user has necessary permissions
- Check for conflicting existing tables

### Memory issues

- Increase Docker memory allocation (Docker Desktop → Settings → Resources)
- Monitor application memory usage
- Consider upgrading to a larger cloud plan

## Scaling Considerations

For production deployments expecting high traffic:

1. **Horizontal Scaling**: Deploy multiple application instances with load balancer
2. **Database**: Use managed PostgreSQL with read replicas
3. **Caching**: Add Redis for session management and caching
4. **CDN**: Use CDN for static assets
5. **Connection Pooling**: Configure optimal pool size based on load

## Support

For issues or questions:

- Check application logs first
- Review error messages carefully
- Consult README.md for configuration details
- Refer to cloud platform documentation for platform-specific issues

## License

This project is proprietary. All rights reserved.

