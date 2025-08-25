/**
 * High-performance caching system for Heritage100 CRM
 * Optimized for AI agent operations and dashboard responsiveness
 */

import { Redis } from 'ioredis';

// Cache configuration
const CACHE_CONFIG = {
  // Dashboard metrics cache (5 minutes)
  DASHBOARD_METRICS: { ttl: 300, key: 'dashboard:metrics' },
  
  // Client data cache (2 minutes for active operations)
  CLIENT_DATA: { ttl: 120, keyPrefix: 'client:' },
  
  // Property search results (10 minutes)
  PROPERTY_SEARCH: { ttl: 600, keyPrefix: 'property:search:' },
  
  // Agent performance metrics (15 minutes)
  AGENT_METRICS: { ttl: 900, keyPrefix: 'agent:metrics:' },
  
  // Construction updates (5 minutes)
  CONSTRUCTION_UPDATES: { ttl: 300, keyPrefix: 'construction:' },
  
  // Payment status cache (1 minute for real-time updates)
  PAYMENT_STATUS: { ttl: 60, keyPrefix: 'payment:status:' },
  
  // AI agent query results (30 minutes)
  AI_QUERY_RESULTS: { ttl: 1800, keyPrefix: 'ai:query:' },
  
  // Session data (1 hour)
  SESSION_DATA: { ttl: 3600, keyPrefix: 'session:' }
};

class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: any; expires: number }> = new Map();
  private useRedis: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
        
        await this.redis.ping();
        this.useRedis = true;
        console.log('✅ Redis cache initialized');
      } else {
        console.log('⚠️ Redis not configured, using memory cache');
      }
    } catch (error) {
      console.warn('⚠️ Redis connection failed, falling back to memory cache:', error);
      this.useRedis = false;
    }
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redis) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Memory cache fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.data;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
      } else {
        // Memory cache fallback
        this.memoryCache.set(key, {
          data,
          expires: Date.now() + (ttlSeconds * 1000)
        });
        
        // Clean up expired entries periodically
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Memory cache pattern deletion
        const keysToDelete = Array.from(this.memoryCache.keys())
          .filter(key => key.includes(pattern.replace('*', '')));
        keysToDelete.forEach(key => this.memoryCache.delete(key));
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Get or set cached data with a function
   */
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFunction();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Clean up expired memory cache entries
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ type: string; size: number; hitRate?: number }> {
    if (this.useRedis && this.redis) {
      const info = await this.redis.info('memory');
      const memoryUsage = info.match(/used_memory:(\d+)/)?.[1] || '0';
      return {
        type: 'redis',
        size: parseInt(memoryUsage),
      };
    } else {
      return {
        type: 'memory',
        size: this.memoryCache.size,
      };
    }
  }
}

// Singleton instance
export const cache = new CacheManager();

/**
 * Cache helper functions for specific use cases
 */
export class CacheHelpers {
  /**
   * Cache dashboard metrics
   */
  static async getDashboardMetrics() {
    return cache.getOrSet(
      CACHE_CONFIG.DASHBOARD_METRICS.key,
      async () => {
        // This would be replaced with actual dashboard metrics query
        return {
          totalClients: 0,
          activeProperties: 0,
          totalRevenue: 0,
          conversionRate: 0,
          timestamp: new Date().toISOString()
        };
      },
      CACHE_CONFIG.DASHBOARD_METRICS.ttl
    );
  }

  /**
   * Cache client data
   */
  static async getClientData(clientId: string) {
    return cache.getOrSet(
      `${CACHE_CONFIG.CLIENT_DATA.keyPrefix}${clientId}`,
      async () => {
        // This would be replaced with actual client query
        return { id: clientId, cached: true };
      },
      CACHE_CONFIG.CLIENT_DATA.ttl
    );
  }

  /**
   * Cache property search results
   */
  static async getPropertySearchResults(searchParams: any) {
    const searchKey = `${CACHE_CONFIG.PROPERTY_SEARCH.keyPrefix}${JSON.stringify(searchParams)}`;
    return cache.getOrSet(
      searchKey,
      async () => {
        // This would be replaced with actual property search query
        return { results: [], searchParams, cached: true };
      },
      CACHE_CONFIG.PROPERTY_SEARCH.ttl
    );
  }

  /**
   * Cache agent performance metrics
   */
  static async getAgentMetrics(agentName: string) {
    return cache.getOrSet(
      `${CACHE_CONFIG.AGENT_METRICS.keyPrefix}${agentName}`,
      async () => {
        // This would be replaced with actual agent metrics query
        return { agent: agentName, metrics: {}, cached: true };
      },
      CACHE_CONFIG.AGENT_METRICS.ttl
    );
  }

  /**
   * Invalidate client-related caches
   */
  static async invalidateClientCache(clientId: string) {
    await cache.delete(`${CACHE_CONFIG.CLIENT_DATA.keyPrefix}${clientId}`);
    await cache.delete(CACHE_CONFIG.DASHBOARD_METRICS.key);
    await cache.deletePattern(`${CACHE_CONFIG.AI_QUERY_RESULTS.keyPrefix}*client*${clientId}*`);
  }

  /**
   * Invalidate property-related caches
   */
  static async invalidatePropertyCache(propertyId?: string) {
    await cache.deletePattern(`${CACHE_CONFIG.PROPERTY_SEARCH.keyPrefix}*`);
    await cache.delete(CACHE_CONFIG.DASHBOARD_METRICS.key);
    if (propertyId) {
      await cache.deletePattern(`${CACHE_CONFIG.CONSTRUCTION_UPDATES.keyPrefix}${propertyId}*`);
    }
  }

  /**
   * Invalidate payment-related caches
   */
  static async invalidatePaymentCache(clientId: string) {
    await cache.deletePattern(`${CACHE_CONFIG.PAYMENT_STATUS.keyPrefix}${clientId}*`);
    await cache.delete(CACHE_CONFIG.DASHBOARD_METRICS.key);
  }
}

/**
 * Cache middleware for API routes
 */
export function withCache(ttlSeconds: number = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `api:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      const result = await method.apply(this, args);
      await cache.set(cacheKey, result, ttlSeconds);
      
      return result;
    };
    
    return descriptor;
  };
}

export default cache;
