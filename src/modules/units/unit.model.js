// src/modules/data/unit.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Unit = sequelize.define('Unit', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        project_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projects', key: 'id' } },
        area: { type: DataTypes.FLOAT, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('Available', 'Booked', 'Sold'), defaultValue: 'Available' },
    }, {
        tableName: 'units',
        timestamps: true,
    });
    return Unit;
};