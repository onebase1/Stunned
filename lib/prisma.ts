import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() };
  }
}

// Transaction helper
export async function executeTransaction<T>(
  operations: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await operations(tx);
  });
}

// Pagination helper
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions & { where?: any; include?: any; select?: any } = {}
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    where = {},
    include,
    select,
  } = options;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      select,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Search helper for full-text search
export function buildSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm) return {};

  const searchConditions = fields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive' as const,
    },
  }));

  return {
    OR: searchConditions,
  };
}

// Date range helper
export function buildDateRangeQuery(
  field: string,
  startDate?: Date | string,
  endDate?: Date | string
) {
  const query: any = {};

  if (startDate || endDate) {
    query[field] = {};
    
    if (startDate) {
      query[field].gte = typeof startDate === 'string' ? new Date(startDate) : startDate;
    }
    
    if (endDate) {
      query[field].lte = typeof endDate === 'string' ? new Date(endDate) : endDate;
    }
  }

  return query;
}

// Soft delete helper (if needed)
export async function softDelete(model: any, id: string) {
  return await model.update({
    where: { id },
    data: { 
      status: 'inactive',
      updatedAt: new Date(),
    },
  });
}

// Bulk operations helper
export async function bulkCreate<T>(model: any, data: T[]) {
  return await model.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function bulkUpdate<T>(model: any, updates: Array<{ where: any; data: T }>) {
  return await Promise.all(
    updates.map(({ where, data }) =>
      model.update({ where, data })
    )
  );
}

// Analytics helpers
export async function getClientStageDistribution() {
  const distribution = await prisma.client.groupBy({
    by: ['currentStage'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return distribution.map(item => ({
    stage: item.currentStage,
    count: item._count.id,
  }));
}

export async function getLeadSourceAnalytics() {
  const analytics = await prisma.client.groupBy({
    by: ['leadSource'],
    _count: {
      id: true,
    },
    where: {
      leadSource: {
        not: null,
      },
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return analytics.map(item => ({
    source: item.leadSource || 'Unknown',
    count: item._count.id,
  }));
}

export async function getMonthlyLeadTrend(months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const leads = await prisma.client.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};
  
  leads.forEach(lead => {
    const monthKey = lead.createdAt.toISOString().substring(0, 7); // YYYY-MM
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  return Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export default prisma;
