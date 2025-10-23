/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles and their permissions across the application
 * @module config/roles
 */

/**
 * Application roles
 * @enum {string}
 */
const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    SALES: 'Sales',
    VIEWER: 'Viewer'
};

/**
 * Resource types that can be accessed
 * @enum {string}
 */
const RESOURCES = {
    TENANTS: 'tenants',
    USERS: 'users',
    PROJECTS: 'projects',
    UNITS: 'units',
    AUDIT_LOGS: 'audit_logs',
    STATS: 'stats'
};

/**
 * Actions that can be performed on resources
 * @enum {string}
 */
const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    BOOK: 'book', // Special action for units
    DEACTIVATE: 'deactivate', // Special action for tenants
    ACTIVATE: 'activate' // Special action for tenants
};

/**
 * Permission matrix defining what each role can do
 * Structure: { [ROLE]: { [RESOURCE]: [ACTIONS] } }
 */
const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        [RESOURCES.TENANTS]: [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
            ACTIONS.DEACTIVATE,
            ACTIONS.ACTIVATE
        ],
        [RESOURCES.STATS]: [ACTIONS.READ],
        // Super Admin doesn't directly access tenant-specific resources
    },

    [ROLES.ADMIN]: {
        [RESOURCES.USERS]: [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
            ACTIONS.DELETE
        ],
        [RESOURCES.PROJECTS]: [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
            ACTIONS.DELETE
        ],
        [RESOURCES.UNITS]: [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
            ACTIONS.DELETE,
            ACTIONS.BOOK
        ],
        [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ]
    },

    [ROLES.SALES]: {
        [RESOURCES.PROJECTS]: [ACTIONS.READ],
        [RESOURCES.UNITS]: [
            ACTIONS.READ,
            ACTIONS.BOOK
        ],
        [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ]
    },

    [ROLES.VIEWER]: {
        [RESOURCES.PROJECTS]: [ACTIONS.READ],
        [RESOURCES.UNITS]: [ACTIONS.READ],
        [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ]
    }
};

/**
 * Check if a role has permission to perform an action on a resource
 * @param {string} role - User role
 * @param {string} resource - Resource being accessed
 * @param {string} action - Action being performed
 * @returns {boolean} - Whether permission is granted
 */
const hasPermission = (role, resource, action) => {
    const rolePermissions = PERMISSIONS[role];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
};

/**
 * Check if role is Super Admin
 * @param {string} role - User role
 * @returns {boolean}
 */
const isSuperAdmin = (role) => {
    return role === ROLES.SUPER_ADMIN;
};

/**
 * Check if role is tenant-level admin
 * @param {string} role - User role
 * @returns {boolean}
 */
const isAdmin = (role) => {
    return role === ROLES.ADMIN;
};

module.exports = {
    ROLES,
    RESOURCES,
    ACTIONS,
    PERMISSIONS,
    hasPermission,
    isSuperAdmin,
    isAdmin
};

