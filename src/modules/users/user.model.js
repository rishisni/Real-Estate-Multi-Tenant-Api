// src/modules/users/user.model.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); // Used for secure password hashing

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        tenant_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        name: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        email: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: false // Unique within a tenant's schema
        }, 
        
        // 1. VIRTUAL Field: Used temporarily to accept the plaintext password
        password: {
            type: DataTypes.VIRTUAL,
        },

        password_hash: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        role: { 
            type: DataTypes.ENUM('Admin', 'Sales', 'Viewer', 'Super Admin'), 
            allowNull: false 
        },
    }, {
        tableName: 'users',
        timestamps: false,
    });

    // --- Sequelize Hooks (Data Hashing) ---

    // Hook 1: Hash password before creating a new user
    User.beforeCreate(async (user) => {
        if (user.password) {
            user.password_hash = await bcrypt.hash(user.password, 10);
            user.password = undefined; // Remove plaintext password before saving
        }
    });

    // Hook 2: Hash password before updating a user's record
    User.beforeUpdate(async (user) => {
        // Only run hashing if the 'password' virtual field was actually provided during the update call
        if (user.password) {
            user.password_hash = await bcrypt.hash(user.password, 10);
            user.password = undefined;
        }
    });

    // --- Utility Method ---
    /**
     * Compares a plaintext password with the stored hash using bcryptjs.
     */
    User.prototype.comparePassword = function (password) {
        return bcrypt.compare(password, this.password_hash);
    };

    return User;
};