// src/modules/data/project.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Project = sequelize.define('Project', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        builder_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenants', key: 'id' } }, // References Tenant (Public Schema)
        name: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: false },
    }, {
        tableName: 'projects',
        timestamps: true, // Optional: Add createdAt/updatedAt
    });
    return Project;
};