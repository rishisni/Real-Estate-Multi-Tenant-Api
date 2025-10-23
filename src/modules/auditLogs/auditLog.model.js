// src/modules/data/auditLog.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        action: { type: DataTypes.STRING, allowNull: false }, // CREATE, UPDATE, DELETE, BOOKING
        entity: { type: DataTypes.STRING, allowNull: false }, // Project, Unit, User
        entity_id: { type: DataTypes.INTEGER, allowNull: false },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'audit_logs',
        timestamps: false,
    });
    return AuditLog;
};