/**
 * Query optimization utilities for Heritage100 CRM
 * Optimized for AI agent operations and high-performance database queries
 */

import { PrismaClient } from '@prisma/client';
import { cache, CacheHelpers } from './cache';

// Query optimization configuration
const QUERY_CONFIG = {
  // Batch size for bulk operations
  BATCH_SIZE: 100,
  
  // Connection pool settings
  CONNECTION_POOL: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 60000,
  },
  
  // Query timeout settings
  QUERY_TIMEOUT: 30000,
  
  // Pagination limits
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
};

/**
 * Optimized Prisma client with connection pooling and query optimization
 */
export class OptimizedPrismaClient {
  private static instance: PrismaClient;
  
  static getInstance(): PrismaClient {
    if (!OptimizedPrismaClient.instance) {
      OptimizedPrismaClient.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      
      // Add query optimization middleware
      OptimizedPrismaClient.instance.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        
        // Log slow queries in development
        if (process.env.NODE_ENV === 'development' && (after - before) > 1000) {
          console.warn(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
        }
        
        return result;
      });
    }
    
    return OptimizedPrismaClient.instance;
  }
}

/**
 * Optimized query builders for common operations
 */
export class QueryBuilder {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = OptimizedPrismaClient.getInstance();
  }

  /**
   * Optimized client search with full-text search and caching
   */
  async searchClients(params: {
    query?: string;
    stage?: string;
    agent?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const cacheKey = `client:search:${JSON.stringify(params)}`;
    
    return cache.getOrSet(cacheKey, async () => {
      const { query, stage, agent, priority, page = 1, limit = QUERY_CONFIG.DEFAULT_PAGE_SIZE } = params;
      const offset = (page - 1) * Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE);
      
      const where: any = {
        status: 'active',
      };
      
      // Add filters
      if (stage) where.currentStage = stage;
      if (agent) where.assignedAgent = agent;
      if (priority) where.priorityLevel = priority;
      
      // Full-text search
      if (query) {
        where.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { specialRequirements: { contains: query, mode: 'insensitive' } },
        ];
      }
      
      const [clients, total] = await Promise.all([
        this.prisma.client.findMany({
          where,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            currentStage: true,
            priorityLevel: true,
            assignedAgent: true,
            budgetMin: true,
            budgetMax: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            { priorityLevel: 'desc' },
            { updatedAt: 'desc' },
          ],
          skip: offset,
          take: Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE),
        }),
        this.prisma.client.count({ where }),
      ]);
      
      return {
        clients,
        pagination: {
          page,
          limit: Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE),
          total,
          pages: Math.ceil(total / Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE)),
        },
      };
    }, 120); // 2-minute cache
  }

  /**
   * Optimized property search with matching algorithm
   */
  async searchProperties(params: {
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    propertyType?: string;
    available?: boolean;
    page?: number;
    limit?: number;
  }) {
    const cacheKey = `property:search:${JSON.stringify(params)}`;
    
    return cache.getOrSet(cacheKey, async () => {
      const { 
        bedrooms, 
        minPrice, 
        maxPrice, 
        location, 
        propertyType, 
        available = true,
        page = 1, 
        limit = QUERY_CONFIG.DEFAULT_PAGE_SIZE 
      } = params;
      
      const offset = (page - 1) * Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE);
      
      const where: any = { available };
      
      if (bedrooms) where.bedrooms = bedrooms;
      if (propertyType) where.propertyType = propertyType;
      if (location) where.location = { contains: location, mode: 'insensitive' };
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      
      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          select: {
            id: true,
            propertyName: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            squareFeet: true,
            price: true,
            location: true,
            constructionStatus: true,
            completionPercentage: true,
            estimatedCompletionDate: true,
            images: true,
            available: true,
          },
          orderBy: [
            { available: 'desc' },
            { completionPercentage: 'desc' },
            { price: 'asc' },
          ],
          skip: offset,
          take: Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE),
        }),
        this.prisma.property.count({ where }),
      ]);
      
      return {
        properties,
        pagination: {
          page,
          limit: Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE),
          total,
          pages: Math.ceil(total / Math.min(limit, QUERY_CONFIG.MAX_PAGE_SIZE)),
        },
      };
    }, 600); // 10-minute cache
  }

  /**
   * Optimized dashboard metrics with aggressive caching
   */
  async getDashboardMetrics() {
    return cache.getOrSet('dashboard:metrics:complete', async () => {
      const [
        totalClients,
        activeClients,
        totalProperties,
        availableProperties,
        totalContracts,
        activeContracts,
        totalRevenue,
        overduePayments,
        recentInteractions,
        constructionProgress,
      ] = await Promise.all([
        this.prisma.client.count(),
        this.prisma.client.count({ where: { status: 'active' } }),
        this.prisma.property.count(),
        this.prisma.property.count({ where: { available: true } }),
        this.prisma.contract.count(),
        this.prisma.contract.count({ where: { contractStatus: 'active' } }),
        this.prisma.contract.aggregate({
          _sum: { totalAmount: true },
          where: { contractStatus: { in: ['active', 'completed'] } },
        }),
        this.prisma.payment.count({
          where: {
            paymentStatus: { not: 'paid' },
            dueDate: { lt: new Date() },
          },
        }),
        this.prisma.interaction.count({
          where: {
            interactionDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        this.prisma.property.aggregate({
          _avg: { completionPercentage: true },
          where: { constructionStatus: { not: 'completed' } },
        }),
      ]);
      
      return {
        clients: {
          total: totalClients,
          active: activeClients,
        },
        properties: {
          total: totalProperties,
          available: availableProperties,
        },
        contracts: {
          total: totalContracts,
          active: activeContracts,
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
        },
        payments: {
          overdue: overduePayments,
        },
        interactions: {
          recent: recentInteractions,
        },
        construction: {
          avgProgress: constructionProgress._avg.completionPercentage || 0,
        },
        timestamp: new Date().toISOString(),
      };
    }, 300); // 5-minute cache
  }

  /**
   * Optimized agent performance metrics
   */
  async getAgentPerformance(agentName?: string) {
    const cacheKey = `agent:performance:${agentName || 'all'}`;
    
    return cache.getOrSet(cacheKey, async () => {
      const where = agentName ? { assignedAgent: agentName } : {};
      
      const [
        clientsByStage,
        revenueByAgent,
        interactionMetrics,
        conversionRates,
      ] = await Promise.all([
        this.prisma.client.groupBy({
          by: ['assignedAgent', 'currentStage'],
          where: { ...where, status: 'active' },
          _count: true,
        }),
        this.prisma.contract.groupBy({
          by: ['client'],
          where: { contractStatus: { in: ['active', 'completed'] } },
          _sum: { totalAmount: true },
        }),
        this.prisma.interaction.groupBy({
          by: ['agentName'],
          where: {
            ...where,
            interactionDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          _count: true,
          _avg: { responseTimeMinutes: true },
        }),
        this.prisma.client.groupBy({
          by: ['assignedAgent'],
          where: { ...where, currentStage: 'COMPLETED' },
          _count: true,
        }),
      ]);
      
      return {
        clientsByStage,
        revenueByAgent,
        interactionMetrics,
        conversionRates,
        timestamp: new Date().toISOString(),
      };
    }, 900); // 15-minute cache
  }

  /**
   * Batch operations for bulk updates
   */
  async batchUpdateClients(updates: Array<{ id: string; data: any }>) {
    const batches = [];
    for (let i = 0; i < updates.length; i += QUERY_CONFIG.BATCH_SIZE) {
      batches.push(updates.slice(i, i + QUERY_CONFIG.BATCH_SIZE));
    }
    
    const results = [];
    for (const batch of batches) {
      const batchPromises = batch.map(({ id, data }) =>
        this.prisma.client.update({
          where: { id },
          data,
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Invalidate caches for updated clients
      await Promise.all(
        batch.map(({ id }) => CacheHelpers.invalidateClientCache(id))
      );
    }
    
    return results;
  }
}

/**
 * Query performance monitoring
 */
export class QueryMonitor {
  private static queryStats: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();
  
  static logQuery(operation: string, duration: number) {
    const stats = this.queryStats.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    this.queryStats.set(operation, stats);
  }
  
  static getStats() {
    return Object.fromEntries(this.queryStats);
  }
  
  static resetStats() {
    this.queryStats.clear();
  }
}

// Export singleton instance
export const queryBuilder = new QueryBuilder();
