/**
 * Swagger/OpenAPI Configuration
 * 
 * Provides interactive API documentation accessible at /api-docs
 * Uses JSDoc comments in route files to generate documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Housingram API',
      version: '1.0.0',
      description: 'Multi-tenant Property Management System - Schema-per-tenant architecture for builders to manage projects, units, and users',
      contact: {
        name: 'Housingram Support',
        email: 'support@housingram.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:{port}/api',
        description: 'Development Server',
        variables: {
          port: {
            default: '3000',
            description: 'Server port (default: 3000)'
          }
        }
      },
      {
        url: 'https://real-estate-multi-tenant-api.onrender.com/api',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        }
      },
      schemas: {
        // Error Response
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found'
                },
                code: {
                  type: 'string',
                  example: 'NOT_FOUND'
                }
              }
            }
          }
        },
        
        // Tenant Schema
        Tenant: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Acme Builders'
            },
            contact_email: {
              type: 'string',
              format: 'email',
              example: 'admin@acmebuilders.com'
            },
            contact_phone: {
              type: 'string',
              example: '+91-9876543210'
            },
            subscription_type: {
              type: 'string',
              enum: ['Basic', 'Pro', 'Enterprise'],
              example: 'Pro'
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            schema_name: {
              type: 'string',
              example: 'tenant_1_acme_builders'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // User Schema
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['Super Admin', 'Admin', 'Sales', 'Viewer'],
              example: 'Admin'
            },
            tenant_id: {
              type: 'integer',
              nullable: true,
              example: 1
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // Project Schema
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Sunrise Apartments'
            },
            location: {
              type: 'string',
              example: 'Mumbai, Maharashtra'
            },
            builder_id: {
              type: 'integer',
              example: 1
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Luxury apartments with modern amenities'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // Unit Schema
        Unit: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            project_id: {
              type: 'integer',
              example: 1
            },
            unit_number: {
              type: 'string',
              example: 'A-101'
            },
            area: {
              type: 'number',
              format: 'decimal',
              example: 1250.50
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 5500000
            },
            status: {
              type: 'string',
              enum: ['Available', 'Booked', 'Sold'],
              example: 'Available'
            },
            booked_by: {
              type: 'integer',
              nullable: true,
              example: null
            },
            booked_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // Audit Log Schema
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            action: {
              type: 'string',
              example: 'CREATE'
            },
            entity_type: {
              type: 'string',
              example: 'unit'
            },
            entity_id: {
              type: 'integer',
              example: 5
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (Super Admin & Tenant users). Start here to get your JWT token!'
      },
      {
        name: 'Super Admin - Tenants',
        description: 'Tenant management (Super Admin only) - Create and manage builder accounts'
      },
      {
        name: 'Super Admin - Statistics',
        description: 'Super Admin statistics and analytics across all tenants'
      },
      {
        name: 'Users',
        description: 'User management within tenant (Admin, Sales, Viewer)'
      },
      {
        name: 'Projects',
        description: 'Property project management within tenant'
      },
      {
        name: 'Units',
        description: 'Unit management and booking within tenant projects'
      },
      {
        name: 'Audit Logs',
        description: 'View audit trail of all actions and changes'
      }
    ]
  },
  // Paths to files containing JSDoc annotations
  apis: [
    './src/modules/*/routes.js',
    './src/modules/*/*.routes.js',
    './src/routes/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


