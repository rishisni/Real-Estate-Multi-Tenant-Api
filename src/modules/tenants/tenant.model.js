// src/modules/tenants/tenant.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tenant = sequelize.define('Tenant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING, allowNull: false },
        subscription_type: { type: DataTypes.ENUM('Basic', 'Premium'), allowNull: false },
        schema_name: { type: DataTypes.STRING, allowNull: false, unique: true },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        tableName: 'tenants',
        timestamps: false,
        schema: 'public' 
    });

    return Tenant;
};