/**
 * AI Agent Database Interface for Heritage100 CRM
 * Specialized functions and views optimized for AI agent queries
 * Supports natural language query processing and automated data updates
 */

import { PrismaClient } from '@prisma/client';
import { cache } from './cache';
import { queryBuilder } from './query-optimizer';

export interface AIQueryContext {
  intent: 'search' | 'update' | 'create' | 'analyze' | 'report';
  entity: 'client' | 'property' | 'contract' | 'payment' | 'interaction' | 'construction';
  filters?: Record<string, any>;
  sortBy?: string;
  limit?: number;
  includeRelated?: boolean;
}

export interface AIQueryResult {
  success: boolean;
  data: any;
  summary: string;
  suggestions?: string[];
  metadata: {
    queryTime: number;
    resultCount: number;
    cached: boolean;
  };
}

/**
 * AI Agent Database Interface Class
 */
export class AIAgentInterface {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Process natural language queries and convert to database operations
   */
  async processNaturalLanguageQuery(query: string, context?: Partial<AIQueryContext>): Promise<AIQueryResult> {
    const startTime = Date.now();
    const parsedContext = this.parseNaturalLanguageQuery(query, context);
    
    try {
      let result;
      
      switch (parsedContext.intent) {
        case 'search':
          result = await this.handleSearchQuery(parsedContext);
          break;
        case 'analyze':
          result = await this.handleAnalysisQuery(parsedContext);
          break;
        case 'report':
          result = await this.handleReportQuery(parsedContext);
          break;
        case 'update':
          result = await this.handleUpdateQuery(parsedContext);
          break;
        case 'create':
          result = await this.handleCreateQuery(parsedContext);
          break;
        default:
          throw new Error(`Unsupported query intent: ${parsedContext.intent}`);
      }
      
      const queryTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result.data,
        summary: result.summary,
        suggestions: result.suggestions,
        metadata: {
          queryTime,
          resultCount: Array.isArray(result.data) ? result.data.length : 1,
          cached: result.cached || false,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        summary: `Query failed: ${error.message}`,
        metadata: {
          queryTime: Date.now() - startTime,
          resultCount: 0,
          cached: false,
        },
      };
    }
  }

  /**
   * Parse natural language query into structured context
   */
  private parseNaturalLanguageQuery(query: string, context?: Partial<AIQueryContext>): AIQueryContext {
    const lowerQuery = query.toLowerCase();
    
    // Determine intent
    let intent: AIQueryContext['intent'] = 'search';
    if (lowerQuery.includes('update') || lowerQuery.includes('change') || lowerQuery.includes('modify')) {
      intent = 'update';
    } else if (lowerQuery.includes('create') || lowerQuery.includes('add') || lowerQuery.includes('new')) {
      intent = 'create';
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis') || lowerQuery.includes('performance')) {
      intent = 'analyze';
    } else if (lowerQuery.includes('report') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
      intent = 'report';
    }
    
    // Determine entity
    let entity: AIQueryContext['entity'] = 'client';
    if (lowerQuery.includes('property') || lowerQuery.includes('properties')) {
      entity = 'property';
    } else if (lowerQuery.includes('contract') || lowerQuery.includes('contracts')) {
      entity = 'contract';
    } else if (lowerQuery.includes('payment') || lowerQuery.includes('payments')) {
      entity = 'payment';
    } else if (lowerQuery.includes('interaction') || lowerQuery.includes('communication')) {
      entity = 'interaction';
    } else if (lowerQuery.includes('construction') || lowerQuery.includes('progress')) {
      entity = 'construction';
    }
    
    // Extract filters
    const filters: Record<string, any> = {};
    
    // Extract common filter patterns
    const stageMatch = lowerQuery.match(/stage\s+(\w+)/);
    if (stageMatch) filters.currentStage = stageMatch[1].toUpperCase();
    
    const agentMatch = lowerQuery.match(/agent\s+([a-zA-Z\s]+)/);
    if (agentMatch) filters.assignedAgent = agentMatch[1].trim();
    
    const priorityMatch = lowerQuery.match(/priority\s+(\w+)/);
    if (priorityMatch) filters.priorityLevel = priorityMatch[1];
    
    const statusMatch = lowerQuery.match(/status\s+(\w+)/);
    if (statusMatch) filters.status = statusMatch[1];
    
    // Extract limit
    const limitMatch = lowerQuery.match(/(?:top|first|limit)\s+(\d+)/);
    const limit = limitMatch ? parseInt(limitMatch[1]) : 20;
    
    return {
      intent,
      entity,
      filters,
      limit,
      includeRelated: lowerQuery.includes('with') || lowerQuery.includes('include'),
      ...context,
    };
  }

  /**
   * Handle search queries
   */
  private async handleSearchQuery(context: AIQueryContext) {
    const cacheKey = `ai:search:${JSON.stringify(context)}`;
    
    return cache.getOrSet(cacheKey, async () => {
      let data;
      let summary;
      
      switch (context.entity) {
        case 'client':
          const clientResult = await queryBuilder.searchClients({
            ...context.filters,
            limit: context.limit,
          });
          data = clientResult.clients;
          summary = `Found ${data.length} clients matching your criteria`;
          break;
          
        case 'property':
          const propertyResult = await queryBuilder.searchProperties({
            ...context.filters,
            limit: context.limit,
          });
          data = propertyResult.properties;
          summary = `Found ${data.length} properties matching your criteria`;
          break;
          
        case 'contract':
          data = await this.prisma.contract.findMany({
            where: context.filters,
            take: context.limit,
            include: context.includeRelated ? {
              client: { select: { firstName: true, lastName: true, email: true } },
              property: { select: { propertyName: true, location: true } },
            } : undefined,
          });
          summary = `Found ${data.length} contracts matching your criteria`;
          break;
          
        default:
          throw new Error(`Search not implemented for entity: ${context.entity}`);
      }
      
      return {
        data,
        summary,
        suggestions: this.generateSearchSuggestions(context, data),
        cached: false,
      };
    }, 300);
  }

  /**
   * Handle analysis queries
   */
  private async handleAnalysisQuery(context: AIQueryContext) {
    const cacheKey = `ai:analysis:${JSON.stringify(context)}`;
    
    return cache.getOrSet(cacheKey, async () => {
      let data;
      let summary;
      
      switch (context.entity) {
        case 'client':
          data = await this.getClientAnalytics(context.filters);
          summary = `Client analysis complete: ${data.totalClients} clients analyzed`;
          break;
          
        case 'property':
          data = await this.getPropertyAnalytics(context.filters);
          summary = `Property analysis complete: ${data.totalProperties} properties analyzed`;
          break;
          
        case 'payment':
          data = await this.getPaymentAnalytics(context.filters);
          summary = `Payment analysis complete: ${data.totalPayments} payments analyzed`;
          break;
          
        default:
          throw new Error(`Analysis not implemented for entity: ${context.entity}`);
      }
      
      return {
        data,
        summary,
        suggestions: this.generateAnalysisSuggestions(context, data),
        cached: false,
      };
    }, 600);
  }

  /**
   * Handle report queries
   */
  private async handleReportQuery(context: AIQueryContext) {
    const cacheKey = `ai:report:${JSON.stringify(context)}`;
    
    return cache.getOrSet(cacheKey, async () => {
      const data = await queryBuilder.getDashboardMetrics();
      const summary = `Generated comprehensive report with ${Object.keys(data).length} metric categories`;
      
      return {
        data,
        summary,
        suggestions: [
          'Try asking for specific agent performance metrics',
          'Request property construction progress analysis',
          'Ask for payment overdue analysis',
        ],
        cached: false,
      };
    }, 300);
  }

  /**
   * Handle update queries
   */
  private async handleUpdateQuery(context: AIQueryContext) {
    // This would implement update operations
    // For now, return a placeholder
    return {
      data: { message: 'Update operations require specific implementation' },
      summary: 'Update query received but not yet implemented',
      suggestions: ['Specify exact fields to update', 'Provide client/property ID'],
      cached: false,
    };
  }

  /**
   * Handle create queries
   */
  private async handleCreateQuery(context: AIQueryContext) {
    // This would implement create operations
    // For now, return a placeholder
    return {
      data: { message: 'Create operations require specific implementation' },
      summary: 'Create query received but not yet implemented',
      suggestions: ['Provide all required fields', 'Specify entity type clearly'],
      cached: false,
    };
  }

  /**
   * Get client analytics
   */
  private async getClientAnalytics(filters?: Record<string, any>) {
    const where = filters || {};
    
    const [
      totalClients,
      clientsByStage,
      clientsByAgent,
      clientsByPriority,
      avgResponseTime,
    ] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.groupBy({
        by: ['currentStage'],
        where,
        _count: true,
      }),
      this.prisma.client.groupBy({
        by: ['assignedAgent'],
        where,
        _count: true,
      }),
      this.prisma.client.groupBy({
        by: ['priorityLevel'],
        where,
        _count: true,
      }),
      this.prisma.interaction.aggregate({
        _avg: { responseTimeMinutes: true },
        where: { client: where },
      }),
    ]);
    
    return {
      totalClients,
      clientsByStage,
      clientsByAgent,
      clientsByPriority,
      avgResponseTime: avgResponseTime._avg.responseTimeMinutes || 0,
    };
  }

  /**
   * Get property analytics
   */
  private async getPropertyAnalytics(filters?: Record<string, any>) {
    const where = filters || {};
    
    const [
      totalProperties,
      propertiesByType,
      propertiesByStatus,
      avgCompletion,
      avgPrice,
    ] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.groupBy({
        by: ['propertyType'],
        where,
        _count: true,
      }),
      this.prisma.property.groupBy({
        by: ['constructionStatus'],
        where,
        _count: true,
      }),
      this.prisma.property.aggregate({
        _avg: { completionPercentage: true },
        where,
      }),
      this.prisma.property.aggregate({
        _avg: { price: true },
        where,
      }),
    ]);
    
    return {
      totalProperties,
      propertiesByType,
      propertiesByStatus,
      avgCompletion: avgCompletion._avg.completionPercentage || 0,
      avgPrice: avgPrice._avg.price || 0,
    };
  }

  /**
   * Get payment analytics
   */
  private async getPaymentAnalytics(filters?: Record<string, any>) {
    const where = filters || {};
    
    const [
      totalPayments,
      paymentsByStatus,
      overduePayments,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.groupBy({
        by: ['paymentStatus'],
        where,
        _count: true,
      }),
      this.prisma.payment.count({
        where: {
          ...where,
          paymentStatus: { not: 'paid' },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { ...where, paymentStatus: 'paid' },
      }),
    ]);
    
    return {
      totalPayments,
      paymentsByStatus,
      overduePayments,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
    };
  }

  /**
   * Generate search suggestions
   */
  private generateSearchSuggestions(context: AIQueryContext, data: any[]): string[] {
    const suggestions = [];
    
    if (data.length === 0) {
      suggestions.push('Try broadening your search criteria');
      suggestions.push('Check if filters are too restrictive');
    } else if (data.length > 50) {
      suggestions.push('Consider adding more specific filters');
      suggestions.push('Try limiting results with "top 10" or similar');
    }
    
    suggestions.push(`Try analyzing ${context.entity} performance`);
    suggestions.push(`Generate a ${context.entity} report`);
    
    return suggestions;
  }

  /**
   * Generate analysis suggestions
   */
  private generateAnalysisSuggestions(context: AIQueryContext, data: any): string[] {
    return [
      'Try drilling down into specific metrics',
      'Compare with previous time periods',
      'Generate a detailed report',
      'Export data for further analysis',
    ];
  }
}

/**
 * AI Agent Database Views and Functions
 * SQL views optimized for AI agent queries
 */
export class AIAgentViews {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Initialize AI-optimized database views
   */
  async initializeViews() {
    const views = [
      // Client summary view for AI queries
      `
      CREATE OR REPLACE VIEW v_ai_client_summary AS
      SELECT
        c.id,
        c.first_name || ' ' || c.last_name as full_name,
        c.email,
        c.phone,
        c.current_stage,
        c.priority_level,
        c.assigned_agent,
        c.budget_min,
        c.budget_max,
        c.preferred_location,
        c.lead_source,
        c.status,
        c.created_at,
        c.updated_at,
        COUNT(i.id) as interaction_count,
        MAX(i.interaction_date) as last_interaction,
        COUNT(cpm.id) as property_matches,
        COUNT(ct.id) as contracts
      FROM clients c
      LEFT JOIN interactions i ON c.id = i.client_id
      LEFT JOIN client_property_matches cpm ON c.id = cpm.client_id
      LEFT JOIN contracts ct ON c.id = ct.client_id
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone,
               c.current_stage, c.priority_level, c.assigned_agent,
               c.budget_min, c.budget_max, c.preferred_location,
               c.lead_source, c.status, c.created_at, c.updated_at;
      `,

      // Property summary view for AI queries
      `
      CREATE OR REPLACE VIEW v_ai_property_summary AS
      SELECT
        p.id,
        p.property_name,
        p.property_type,
        p.bedrooms,
        p.bathrooms,
        p.square_feet,
        p.price,
        p.location,
        p.construction_status,
        p.completion_percentage,
        p.estimated_completion_date,
        p.available,
        p.created_at,
        COUNT(cpm.id) as interested_clients,
        COUNT(ct.id) as contracts,
        COUNT(cu.id) as construction_updates,
        MAX(cu.update_date) as last_construction_update
      FROM properties p
      LEFT JOIN client_property_matches cpm ON p.id = cpm.property_id
      LEFT JOIN contracts ct ON p.id = ct.property_id
      LEFT JOIN construction_updates cu ON p.id = cu.property_id
      GROUP BY p.id, p.property_name, p.property_type, p.bedrooms,
               p.bathrooms, p.square_feet, p.price, p.location,
               p.construction_status, p.completion_percentage,
               p.estimated_completion_date, p.available, p.created_at;
      `,

      // Agent performance view
      `
      CREATE OR REPLACE VIEW v_ai_agent_performance AS
      SELECT
        assigned_agent as agent_name,
        COUNT(*) as total_clients,
        COUNT(CASE WHEN current_stage = 'COMPLETED' THEN 1 END) as completed_clients,
        COUNT(CASE WHEN priority_level = 'high' THEN 1 END) as high_priority_clients,
        AVG(CASE WHEN current_stage = 'COMPLETED'
            THEN EXTRACT(EPOCH FROM (updated_at - created_at))/86400
            END) as avg_completion_days,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_clients_30d
      FROM clients
      WHERE assigned_agent IS NOT NULL AND status = 'active'
      GROUP BY assigned_agent;
      `,

      // Payment status view for AI queries
      `
      CREATE OR REPLACE VIEW v_ai_payment_status AS
      SELECT
        p.id,
        p.client_id,
        c.first_name || ' ' || c.last_name as client_name,
        p.payment_plan_id,
        p.amount_due,
        p.amount_paid,
        p.due_date,
        p.payment_date,
        p.payment_status,
        p.payment_method,
        CASE
          WHEN p.payment_status != 'paid' AND p.due_date < CURRENT_DATE
          THEN CURRENT_DATE - p.due_date
          ELSE 0
        END as days_overdue,
        pp.total_amount as plan_total,
        pp.installments as plan_installments
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN payment_plans pp ON p.payment_plan_id = pp.id;
      `
    ];

    // Execute each view creation
    for (const view of views) {
      try {
        await this.prisma.$executeRawUnsafe(view);
        console.log('✅ AI view created successfully');
      } catch (error) {
        console.error('❌ Error creating AI view:', error);
      }
    }
  }

  /**
   * Get AI-optimized client data
   */
  async getClientSummary(filters?: Record<string, any>) {
    const whereClause = this.buildWhereClause(filters);

    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM v_ai_client_summary
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ORDER BY priority_level DESC, last_interaction DESC NULLS LAST
      LIMIT 100
    `);
  }

  /**
   * Get AI-optimized property data
   */
  async getPropertySummary(filters?: Record<string, any>) {
    const whereClause = this.buildWhereClause(filters);

    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM v_ai_property_summary
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ORDER BY available DESC, completion_percentage DESC
      LIMIT 100
    `);
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(agentName?: string) {
    const whereClause = agentName ? `WHERE agent_name = '${agentName}'` : '';

    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM v_ai_agent_performance
      ${whereClause}
      ORDER BY completed_clients DESC, total_clients DESC
    `);
  }

  /**
   * Get payment status overview
   */
  async getPaymentStatus(filters?: Record<string, any>) {
    const whereClause = this.buildWhereClause(filters);

    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM v_ai_payment_status
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ORDER BY days_overdue DESC, due_date ASC
      LIMIT 100
    `);
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return '';
    }

    const conditions = Object.entries(filters)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key} = '${value}'`;
        } else if (typeof value === 'number') {
          return `${key} = ${value}`;
        } else if (typeof value === 'boolean') {
          return `${key} = ${value}`;
        }
        return null;
      })
      .filter(Boolean);

    return conditions.join(' AND ');
  }
}

// Export singleton instances
export const aiAgent = new AIAgentInterface();
export const aiViews = new AIAgentViews();
