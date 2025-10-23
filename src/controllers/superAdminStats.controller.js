/**
 * Super Admin Statistics Controller
 * Provides aggregated statistics across all tenants
 * @module controllers/superAdminStats.controller
 */

const { sequelize } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const tenantService = require('../modules/tenants/tenant.service');

class SuperAdminStatsController {
    /**
     * Get comprehensive statistics for super admin dashboard
     * GET /api/v1/super-admin/stats
     */
    async getStats(req, res) {
        try {
            // Get tenant statistics
            const tenantStats = await tenantService.getTenantStats();

            // Get all active tenant schemas
            const tenants = await sequelize.query(
                `SELECT id, schema_name, name FROM public.tenants WHERE is_active = true`,
                { type: sequelize.QueryTypes.SELECT }
            );

            // Aggregate data across all tenant schemas
            let totalProjects = 0;
            let totalUnits = 0;
            let availableUnits = 0;
            let bookedUnits = 0;
            let soldUnits = 0;
            let totalRevenue = 0;

            for (const tenant of tenants) {
                const schemaName = tenant.schema_name;

                // Count projects
                const [projectCount] = await sequelize.query(
                    `SELECT COUNT(*)::int as count FROM "${schemaName}".projects WHERE is_active = true`,
                    { type: sequelize.QueryTypes.SELECT }
                );
                totalProjects += projectCount.count || 0;

                // Count and analyze units
                const [unitStats] = await sequelize.query(
                    `SELECT 
                        COUNT(*)::int as total,
                        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END)::int as available,
                        SUM(CASE WHEN status = 'Booked' THEN 1 ELSE 0 END)::int as booked,
                        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END)::int as sold,
                        SUM(CASE WHEN status = 'Sold' THEN price ELSE 0 END)::numeric as revenue
                    FROM "${schemaName}".units
                    WHERE is_active = true`,
                    { type: sequelize.QueryTypes.SELECT }
                );

                totalUnits += unitStats.total || 0;
                availableUnits += unitStats.available || 0;
                bookedUnits += unitStats.booked || 0;
                soldUnits += unitStats.sold || 0;
                totalRevenue += parseFloat(unitStats.revenue || 0);
            }

            const stats = {
                tenants: tenantStats,
                projects: {
                    total: totalProjects
                },
                units: {
                    total: totalUnits,
                    available: availableUnits,
                    booked: bookedUnits,
                    sold: soldUnits,
                    occupancyRate: totalUnits > 0 
                        ? ((bookedUnits + soldUnits) / totalUnits * 100).toFixed(2) + '%'
                        : '0%'
                },
                revenue: {
                    total: totalRevenue.toFixed(2),
                    currency: 'USD' // You can make this configurable
                }
            };

            return sendSuccess(res, stats, 'Statistics retrieved successfully');
        } catch (error) {
            console.error('Error getting super admin stats:', error);
            return sendError(res, error, 500);
        }
    }
}

module.exports = new SuperAdminStatsController();

