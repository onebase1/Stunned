import express from 'express';
import { AnalyticsService } from '../../lib/supabase-service';
import { authenticate, requireAnalyticsRead } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { analyticsDateRangeSchema, dashboardFiltersSchema } from '../../lib/validations';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireAnalyticsRead);

// GET /api/analytics/dashboard - Main dashboard statistics
router.get('/dashboard',
  validate({ query: dashboardFiltersSchema }),
  async (req, res) => {
    try {
      const { dateRange, agents, stages, leadSources } = req.query as any;

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Build filters
      const clientFilters: any = {};
      if (agents?.length) clientFilters.assignedAgent = { in: agents };
      if (stages?.length) clientFilters.currentStage = { in: stages };
      if (leadSources?.length) clientFilters.leadSource = { in: leadSources };

      // Get basic counts
      const [
        totalClients,
        totalProperties,
        totalLeads,
        leadsThisPeriod,
        qualifiedLeads,
        activeContracts,
        completedHandovers,
        overduePayments
      ] = await Promise.all([
        prisma.client.count({ where: { ...clientFilters, status: 'active' } }),
        prisma.property.count({ where: { available: true } }),
        prisma.client.count({ where: { ...clientFilters, currentStage: 'LEAD' } }),
        prisma.client.count({ 
          where: { 
            ...clientFilters, 
            createdAt: { gte: startDate },
            status: 'active'
          } 
        }),
        prisma.client.count({ 
          where: { 
            ...clientFilters, 
            currentStage: { in: ['QUALIFIED', 'PROPERTY_MATCHED', 'VIEWING', 'NEGOTIATION'] }
          } 
        }),
        prisma.contract.count({ where: { contractStatus: 'signed' } }),
        prisma.client.count({ where: { ...clientFilters, currentStage: 'HANDOVER' } }),
        prisma.payment.count({ 
          where: { 
            paymentStatus: 'overdue',
            dueDate: { lt: now }
          } 
        })
      ]);

      // Calculate revenue metrics
      const revenueData = await prisma.contract.aggregate({
        where: { contractStatus: { in: ['signed', 'completed'] } },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
        _count: true,
      });

      const totalRevenue = Number(revenueData._sum.totalAmount || 0);
      const averageDealSize = Number(revenueData._avg.totalAmount || 0);

      // Calculate conversion rate
      const totalLeadsAllTime = await prisma.client.count({ where: clientFilters });
      const convertedClients = await prisma.client.count({ 
        where: { ...clientFilters, status: 'converted' } 
      });
      const conversionRate = totalLeadsAllTime > 0 ? (convertedClients / totalLeadsAllTime) * 100 : 0;

      // Get properties under construction
      const propertiesUnderConstruction = await prisma.property.count({
        where: {
          constructionStatus: { in: ['foundation', 'structure', 'finishing'] },
          available: true,
        }
      });

      // Get upcoming handovers (next 30 days)
      const upcomingHandovers = await prisma.property.count({
        where: {
          estimatedCompletionDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          available: true,
        }
      });

      const dashboardStats = {
        totalClients,
        totalProperties,
        totalLeads,
        leadsThisPeriod,
        qualifiedLeads,
        activeContracts,
        completedHandovers,
        overduePayments,
        totalRevenue,
        averageDealSize,
        conversionRate: Math.round(conversionRate * 100) / 100,
        propertiesUnderConstruction,
        upcomingHandovers,
      };

      res.json({
        success: true,
        data: dashboardStats,
      });
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch dashboard analytics',
      });
    }
  }
);

// GET /api/analytics/stage-distribution - Client stage distribution
router.get('/stage-distribution', async (req, res) => {
  try {
    const stageDistribution = await prisma.client.groupBy({
      by: ['currentStage'],
      where: { status: 'active' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const totalClients = stageDistribution.reduce((sum, stage) => sum + stage._count.id, 0);

    const data = stageDistribution.map(stage => ({
      stage: stage.currentStage,
      count: stage._count.id,
      percentage: totalClients > 0 ? Math.round((stage._count.id / totalClients) * 100) : 0,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching stage distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch stage distribution',
    });
  }
});

// GET /api/analytics/lead-sources - Lead source analytics
router.get('/lead-sources', async (req, res) => {
  try {
    const leadSources = await prisma.client.groupBy({
      by: ['leadSource'],
      where: { 
        status: 'active',
        leadSource: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const totalLeads = leadSources.reduce((sum, source) => sum + source._count.id, 0);

    const data = leadSources.map(source => ({
      source: source.leadSource || 'Unknown',
      count: source._count.id,
      percentage: totalLeads > 0 ? Math.round((source._count.id / totalLeads) * 100) : 0,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch lead sources',
    });
  }
});

// GET /api/analytics/monthly-trends - Monthly lead and conversion trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsBack = Number(months);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get monthly lead data
    const leads = await prisma.client.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'active',
      },
      select: {
        createdAt: true,
        status: true,
        currentStage: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { leads: number; conversions: number }> = {};
    
    leads.forEach(lead => {
      const monthKey = lead.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { leads: 0, conversions: 0 };
      }
      monthlyData[monthKey].leads++;
      
      if (['CONTRACT', 'PAYMENT_SETUP', 'CONSTRUCTION', 'HANDOVER'].includes(lead.currentStage)) {
        monthlyData[monthKey].conversions++;
      }
    });

    const data = Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month,
        leads: stats.leads,
        conversions: stats.conversions,
        conversionRate: stats.leads > 0 ? Math.round((stats.conversions / stats.leads) * 100) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch monthly trends',
    });
  }
});

// GET /api/analytics/agent-performance - Agent performance metrics
router.get('/agent-performance', async (req, res) => {
  try {
    const agentStats = await prisma.client.groupBy({
      by: ['assignedAgent'],
      where: { 
        status: 'active',
        assignedAgent: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const agentPerformance = await Promise.all(
      agentStats.map(async (agent) => {
        const [conversions, avgResponseTime] = await Promise.all([
          prisma.client.count({
            where: {
              assignedAgent: agent.assignedAgent,
              status: 'converted',
            }
          }),
          prisma.interaction.aggregate({
            where: {
              agentName: agent.assignedAgent,
              responseTimeMinutes: { not: null },
            },
            _avg: { responseTimeMinutes: true },
          })
        ]);

        const conversionRate = agent._count.id > 0 ? (conversions / agent._count.id) * 100 : 0;

        return {
          agent: agent.assignedAgent,
          totalClients: agent._count.id,
          conversions,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgResponseTime: Math.round(Number(avgResponseTime._avg.responseTimeMinutes || 0)),
        };
      })
    );

    res.json({
      success: true,
      data: agentPerformance,
    });
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch agent performance',
    });
  }
});

// GET /api/analytics/revenue-forecast - Revenue forecasting
router.get('/revenue-forecast', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const forecastMonths = Number(months);

    // Get historical revenue data
    const contracts = await prisma.contract.findMany({
      where: {
        contractStatus: { in: ['signed', 'completed'] },
        contractDate: { not: null },
      },
      select: {
        totalAmount: true,
        contractDate: true,
      },
    });

    // Get pipeline data (potential revenue)
    const pipelineClients = await prisma.client.findMany({
      where: {
        currentStage: { in: ['QUALIFIED', 'PROPERTY_MATCHED', 'VIEWING', 'NEGOTIATION'] },
        status: 'active',
      },
      include: {
        propertyMatches: {
          include: {
            property: {
              select: { price: true }
            }
          },
          where: { status: { in: ['interested', 'viewing_scheduled', 'offer_made'] } }
        }
      }
    });

    // Calculate potential pipeline value
    const pipelineValue = pipelineClients.reduce((total, client) => {
      const maxPropertyPrice = Math.max(
        ...client.propertyMatches.map(match => Number(match.property.price || 0)),
        0
      );
      return total + maxPropertyPrice;
    }, 0);

    // Simple forecast based on historical average
    const monthlyRevenue = contracts.reduce((acc, contract) => {
      const month = contract.contractDate?.toISOString().substring(0, 7);
      if (month) {
        acc[month] = (acc[month] || 0) + Number(contract.totalAmount || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    const avgMonthlyRevenue = Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0) / 
                              Math.max(Object.keys(monthlyRevenue).length, 1);

    // Generate forecast
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < forecastMonths; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const monthKey = forecastDate.toISOString().substring(0, 7);
      
      forecast.push({
        month: monthKey,
        forecastRevenue: Math.round(avgMonthlyRevenue),
        confidence: Math.max(0.6 - (i * 0.1), 0.3), // Decreasing confidence over time
      });
    }

    res.json({
      success: true,
      data: {
        pipelineValue: Math.round(pipelineValue),
        avgMonthlyRevenue: Math.round(avgMonthlyRevenue),
        forecast,
      },
    });
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch revenue forecast',
    });
  }
});

// GET /api/analytics/construction-progress - Construction progress overview
router.get('/construction-progress', async (req, res) => {
  try {
    const constructionStats = await prisma.property.groupBy({
      by: ['constructionStatus'],
      where: { 
        available: true,
        constructionStatus: { not: null }
      },
      _count: { id: true },
      _avg: { completionPercentage: true },
    });

    const data = constructionStats.map(stat => ({
      status: stat.constructionStatus,
      count: stat._count.id,
      avgCompletion: Math.round(Number(stat._avg.completionPercentage || 0)),
    }));

    // Get delayed projects
    const now = new Date();
    const delayedProjects = await prisma.property.count({
      where: {
        estimatedCompletionDate: { lt: now },
        constructionStatus: { not: 'completed' },
        available: true,
      }
    });

    res.json({
      success: true,
      data: {
        statusDistribution: data,
        delayedProjects,
      },
    });
  } catch (error) {
    console.error('Error fetching construction progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch construction progress',
    });
  }
});

export default router;
