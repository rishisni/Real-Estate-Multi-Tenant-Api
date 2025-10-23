// src/models/index.js (UPDATED)
const { sequelize } = require('../config/db');

// Import model definition functions
const TenantModel = require('../modules/tenants/tenant.model');
const UserModel = require('../modules/users/user.model'); 
// NEW IMPORTS
const ProjectModel = require('../modules/projects/project.model');
const UnitModel = require('../modules/units/unit.model');
const AuditLogModel = require('../modules/auditLogs/auditLog.model');

// Initialize models
const Tenant = TenantModel(sequelize);
const User = UserModel(sequelize);
// NEW INITIALIZATIONS
const Project = ProjectModel(sequelize);
const Unit = UnitModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Define Associations
Tenant.hasMany(User, { foreignKey: 'tenant_id', constraints: false });
User.belongsTo(Tenant, { foreignKey: 'tenant_id', constraints: false });

// Project/Unit Associations (Tenant-scoped)
Project.hasMany(Unit, { foreignKey: 'project_id', constraints: false });
Unit.belongsTo(Project, { foreignKey: 'project_id', constraints: false });


(async () => {
    try {
      await sequelize.sync({ alter: true }); 
      console.log('✅ Database synchronized successfully.');
    } catch (error) {
      console.error('❌ Error syncing database:', error);
    }
  })();

module.exports = {
    sequelize,
    Tenant,
    User,
    Project,
    Unit,
    AuditLog,
};