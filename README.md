# Housingram Backend - Multi-Tenant Property Management System

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)

A robust, enterprise-grade multi-tenant property management system built with Node.js, Express, and PostgreSQL using schema-per-tenant isolation strategy.

## 🏗️ Architecture Overview

### Multi-Tenancy Strategy
- **Schema-per-tenant**: Each tenant (builder/developer) gets a dedicated PostgreSQL schema
- **Data Isolation**: Complete data segregation between tenants for security and compliance
- **Public Schema**: Stores tenant metadata and Super Admin users
- **Tenant Schemas**: Each contains users, projects, units, and audit logs

### Design Patterns
- **Repository Pattern**: Data access layer separated from business logic
- **DTO (Data Transfer Objects)**: Input/output data transformation and validation
- **Service Layer**: Business logic encapsulation
- **Middleware Chain**: Authentication → Tenant Resolution → RBAC → Audit Logging

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ with Sequelize
- **Migrations**: Umzug
- **Validation**: Joi
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Logging**: Winston with daily log rotation
- **API Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker & Docker Compose

## 📋 Features

### Core Functionality
- ✅ Multi-tenant architecture with complete data isolation
- ✅ Role-based access control (RBAC)
- ✅ JWT-based authentication
- ✅ Automated schema provisioning for new tenants
- ✅ Comprehensive audit logging
- ✅ Property and unit management
- ✅ Unit booking system with status tracking
- ✅ Super Admin dashboard with cross-tenant statistics
- ✅ Winston logging with automatic log rotation
- ✅ Interactive Swagger API documentation

### User Roles
1. **Super Admin** (Public Schema)
   - Onboard and manage tenants
   - View aggregated statistics across all tenants
   - Activate/deactivate tenant accounts

2. **Admin** (Tenant Schema)
   - Full access within tenant
   - User management
   - Project and unit CRUD operations

3. **Sales** (Tenant Schema)
   - View projects and units
   - Book available units
   - View audit logs

4. **Viewer** (Tenant Schema)
   - Read-only access to projects and units

## 🚀 Getting Started

### Prerequisites
- **Docker & Docker Compose** (Recommended - easiest way)
  OR
- **Node.js >= 18.x**
- **PostgreSQL >= 15.x**
- **npm or yarn**

### Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd housingram-backend

# Create environment file
cp .env.example .env
# Edit .env if needed (default values work out of the box)

# Start everything with Docker
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate:public
docker-compose exec app npm run seed:super-admin

# Check logs
docker-compose logs -f app
```

**Access the application:**
- API: http://localhost:3000
- Health Check: http://localhost:3000/api/health
- **Swagger API Docs**: http://localhost:3000/api-docs

**Docker commands:**
```bash
# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Access container shell
docker-compose exec app sh
```

### Option 2: Manual Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd housingram-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. **Create PostgreSQL database**
```bash
psql -U postgres
CREATE DATABASE housingram_db;
\q
```

5. **Run migrations and seed Super Admin**
```bash
# Run public schema migrations (creates tenants and super admin users tables)
npm run migrate:public

# Create initial Super Admin user
npm run seed:super-admin

# Or run both with a single command
npm run setup
```

6. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will be running at `http://localhost:3000`

## 📖 Documentation

### Interactive API Documentation

Access comprehensive, interactive API documentation with Swagger UI:

**URL**: http://localhost:3000/api-docs

Features:
- ✅ Complete API reference for all endpoints
- ✅ Try-it-out functionality with live requests
- ✅ Request/response examples
- ✅ Authentication flow testing
- ✅ Schema definitions

### Additional Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide for Docker and cloud platforms (Railway, Render, DigitalOcean)
- **[LOGGING_GUIDE.md](./LOGGING_GUIDE.md)** - Winston logging configuration and usage
- **[POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)** - API testing with Postman collection
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical architecture and implementation details
- **[GIT_GUIDE.md](./GIT_GUIDE.md)** - Git workflow and best practices

## 📚 API Documentation (Quick Reference)

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

#### Super Admin Login
```http
POST /api/v1/auth/super-admin/login
Content-Type: application/json

{
  "email": "superadmin@housingram.com",
  "password": "SuperAdmin@123"
}
```

#### Tenant User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@tenant.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <your-jwt-token>
```

### Super Admin Endpoints

#### Create Tenant
```http
POST /api/v1/super-admin/tenants
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "name": "ABC Builders",
  "contact": "contact@abcbuilders.com",
  "subscription_type": "Premium",
  "adminName": "John Doe",
  "adminEmail": "admin@abcbuilders.com",
  "adminPassword": "SecurePass123"
}
```

#### List All Tenants
```http
GET /api/v1/super-admin/tenants?page=1&limit=10&activeOnly=true
Authorization: Bearer <super-admin-token>
```

#### Get Tenant by ID
```http
GET /api/v1/super-admin/tenants/:id
Authorization: Bearer <super-admin-token>
```

#### Update Tenant
```http
PATCH /api/v1/super-admin/tenants/:id
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "name": "ABC Builders Ltd",
  "subscription_type": "Basic"
}
```

#### Activate/Deactivate Tenant
```http
PATCH /api/v1/super-admin/tenants/:id/activate
PATCH /api/v1/super-admin/tenants/:id/deactivate
Authorization: Bearer <super-admin-token>
```

#### Get Statistics
```http
GET /api/v1/super-admin/stats
Authorization: Bearer <super-admin-token>
```

### Tenant User Management

#### Create User
```http
POST /api/v1/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "SecurePass123",
  "role": "Sales"
}
```

#### List Users
```http
GET /api/v1/users?page=1&limit=10
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PATCH /api/v1/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "role": "Admin"
}
```

#### Delete User
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin-token>
```

### Project Management

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Sunrise Apartments",
  "location": "123 Main St, City",
  "description": "Luxury apartments in prime location",
  "total_units": 50,
  "status": "Planning"
}
```

#### List Projects
```http
GET /api/v1/projects?page=1&limit=10&status=Planning
Authorization: Bearer <token>
```

#### Get Project by ID
```http
GET /api/v1/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PATCH /api/v1/projects/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Under Construction",
  "total_units": 52
}
```

#### Delete Project
```http
DELETE /api/v1/projects/:id
Authorization: Bearer <admin-token>
```

### Unit Management

#### Create Unit
```http
POST /api/v1/units
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "project_id": 1,
  "unit_number": "A-101",
  "floor": 1,
  "area": 1200.50,
  "bedrooms": 3,
  "bathrooms": 2,
  "price": 250000
}
```

#### List Units with Filters
```http
GET /api/v1/units?project_id=1&status=Available&min_price=200000&max_price=300000&bedrooms=3
Authorization: Bearer <token>
```

#### Get Unit by ID
```http
GET /api/v1/units/:id
Authorization: Bearer <token>
```

#### Update Unit
```http
PATCH /api/v1/units/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 260000,
  "floor": 2
}
```

#### Book Unit
```http
POST /api/v1/units/:id/book
Authorization: Bearer <sales-or-admin-token>
```

#### Delete Unit
```http
DELETE /api/v1/units/:id
Authorization: Bearer <admin-token>
```

### Audit Logs

#### List Audit Logs
```http
GET /api/v1/audit-logs?action=CREATE&entity=unit&start_date=2024-01-01
Authorization: Bearer <admin-token>
```

#### Get Audit Log by ID
```http
GET /api/v1/audit-logs/:id
Authorization: Bearer <admin-token>
```

## 🗄️ Database Schema

### Public Schema
- `tenants` - Tenant/builder information
- `users` - Super Admin users only

### Tenant Schema (e.g., `tenant_1`, `tenant_2`)
- `users` - Tenant-specific users (Admin, Sales, Viewer)
- `projects` - Property projects
- `units` - Individual units within projects
- `audit_logs` - Audit trail of all operations

## 🔐 Security Features

- JWT-based stateless authentication
- Bcrypt password hashing with salt rounds
- Role-based access control (RBAC)
- Schema-level data isolation
- Automatic audit logging of all mutations
- Input validation using Joi schemas
- SQL injection protection via parameterized queries

## 📊 Migration Commands

```bash
# Public schema migrations
npm run migrate:public           # Run public schema migrations
npm run migrate:public:down      # Rollback public schema migrations

# Tenant schema migrations
npm run migrate:tenant up <schema_name>    # Run migrations on specific tenant
npm run migrate:tenant up all              # Run migrations on all tenants
npm run migrate:tenant down <schema_name>  # Rollback on specific tenant

# Seeding
npm run seed:super-admin         # Create initial Super Admin user

# Complete setup
npm run setup                    # Run public migrations + seed Super Admin
```

## 🏗️ Project Structure

```
housingram-backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # Database configuration
│   │   └── roles.js              # RBAC configuration
│   ├── controllers/
│   │   └── superAdminStats.controller.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── tenantResolver.js    # Schema resolution
│   │   ├── rbac.js               # Role-based access control
│   │   ├── validate.js           # Joi validation
│   │   └── auditLogger.js        # Audit logging
│   ├── migrations/
│   │   ├── public/               # Public schema migrations
│   │   ├── tenant/               # Tenant schema migrations
│   │   ├── umzug-public.js       # Public migration runner
│   │   └── umzug-tenant.js       # Tenant migration runner
│   ├── modules/
│   │   ├── tenants/              # Tenant management
│   │   │   ├── dto/
│   │   │   ├── repository/
│   │   │   ├── tenant.service.js
│   │   │   ├── tenant.controller.js
│   │   │   ├── tenant.routes.js
│   │   │   └── tenant.schema.js
│   │   ├── users/                # User management
│   │   ├── projects/             # Project management
│   │   ├── units/                # Unit management
│   │   └── auditLogs/            # Audit log retrieval
│   ├── routes/
│   │   └── index.js              # Main router
│   └── utils/
│       ├── errors.js             # Custom error classes
│       ├── response.js           # Response utilities
│       └── schemaManager.js      # Schema management
├── scripts/
│   └── seed-super-admin.js       # Super Admin seeder
├── server.js                     # Application entry point
├── package.json
├── .env.example
└── README.md
```

## 🧪 Testing

Create a test tenant and explore the API:

1. **Login as Super Admin**
2. **Create a new tenant** (automatically creates schema + admin user)
3. **Login as tenant admin**
4. **Create projects and units**
5. **Create sales users**
6. **Book units as sales user**
7. **View audit logs**

## 🔄 Workflow Example

1. Super Admin creates tenant "ABC Builders"
   - System creates `tenant_1` schema
   - Runs all tenant migrations
   - Creates admin user in `tenant_1.users`

2. ABC Builders admin logs in
   - JWT contains `tenant_schema: "tenant_1"`
   - All queries automatically scoped to `tenant_1`

3. Admin creates sales user
   - User stored in `tenant_1.users`
   - Action logged in `tenant_1.audit_logs`

4. Sales user books a unit
   - Unit status changes to "Booked"
   - Audit log created with user context

## 📦 Deployment

For production deployment:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete guide for:
  - Local Docker deployment
  - Railway (easiest, free tier)
  - Render (popular, free tier)
  - DigitalOcean App Platform
  - Production checklist
  - Monitoring and troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

ISC

## 👥 Support

For issues and questions, please create an issue in the repository.

## 🎯 Roadmap

- [x] Multi-tenant architecture with schema-per-tenant ✅
- [x] Role-based access control (RBAC) ✅
- [x] Comprehensive API documentation (Swagger/OpenAPI) ✅
- [x] Winston logging with daily log rotation ✅
- [x] Docker containerization ✅
- [x] Cloud deployment guides (Railway, Render, DigitalOcean) ✅
- [ ] Unit and integration tests
- [ ] Payment integration
- [ ] Email notifications
- [ ] File upload for unit images
- [ ] Tenant-specific branding/customization
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Webhook support for integrations

