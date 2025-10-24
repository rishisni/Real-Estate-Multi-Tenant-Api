# Housingram Backend

Multi-tenant property management system built with Node.js, Express, and PostgreSQL. Each tenant gets their own database schema for complete data isolation.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

## Architecture

### Multi-Tenancy
The system uses schema-per-tenant architecture where each tenant (builder/developer) gets a dedicated PostgreSQL schema. The public schema stores tenant metadata and super admin users, while each tenant schema contains their own users, projects, units, and audit logs.

### Tech Stack
- Node.js 18+ with Express
- PostgreSQL 15+ with Sequelize ORM
- JWT authentication with bcrypt password hashing
- Joi validation
- Winston logging
- Swagger/OpenAPI documentation
- Docker support

### User Roles
- **Super Admin**: Manage tenants and view cross-tenant statistics
- **Admin**: Full access within their tenant (user management, projects, units)
- **Sales**: View and book units, access audit logs
- **Viewer**: Read-only access to projects and units

## Features

- Multi-tenant architecture with complete data isolation
- Role-based access control (RBAC)
- JWT authentication and audit logging
- Property and unit management with booking system
- Super Admin dashboard with cross-tenant stats

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended) OR
- Node.js 18+ and PostgreSQL 15+

### Quick Start with Docker

```bash
git clone <repository-url>
cd housingram-backend

cp .env.example .env
docker-compose up -d

# Run migrations and seed data
docker-compose exec app npm run migrate:public
docker-compose exec app npm run seed:super-admin
```

Access the application at http://localhost:3000

### Manual Setup

```bash
npm install
cp .env.example .env

# Update .env with your database credentials
# Create database: CREATE DATABASE housingram_db;

npm run migrate:public
npm run seed:super-admin
npm run dev
```

### Default Credentials
```
Email: superadmin@housingram.com
Password: SuperAdmin@123
```
Change these in production.

## API Documentation

### Interactive API Testing
Use Swagger for testing all endpoints with live requests:
- **Local**: http://localhost:3000/api-docs
- **Production**: https://real-estate-multi-tenant-api.onrender.com/api-docs

### Complete Architecture Guide
For detailed system architecture, database diagrams, authentication flows, and multi-tenant design patterns, visit:

**[Complete API Documentation](https://rishisni.github.io/Real-Estate-Multi-Tenant-Api/API_DOCUMENTATION.html)**

This includes:
- Multi-tenant architecture diagrams
- Database schema with relationships
- Authentication flow (Super Admin vs Tenant users)
- Request processing lifecycle
- RBAC permission matrix
- Tenant onboarding workflow

**Quick API Testing:**
1. Open Swagger UI
2. Login as Super Admin (credentials above)
3. Copy JWT token and click "Authorize"
4. Create a tenant (auto-creates schema + admin user)
5. Login as tenant admin
6. Start creating projects, units, and users

## Database Schema

The system uses schema-per-tenant architecture:
- **Public Schema**: Stores tenants and Super Admin users
- **Tenant Schemas**: Each tenant has isolated tables (users, projects, units, audit logs)

## Deployment

### Docker Deployment
```bash
docker-compose up -d
docker-compose exec app npm run migrate:public
docker-compose exec app npm run seed:super-admin
```

### Environment Variables
Configure the following in your `.env` file:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

## License

ISC

