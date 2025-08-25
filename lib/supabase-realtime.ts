/**
 * Supabase Realtime Integration for Heritage100 CRM
 * Live dashboard updates, real-time notifications, and collaborative features
 */

'use client';

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Realtime event types
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Realtime Manager for handling all real-time subscriptions
 */
export class RealtimeManager {
  private static instance: RealtimeManager;
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: Map<string, Set<Function>> = new Map();

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Subscribe to table changes
   */
  subscribeToTable<T>(
    table: string,
    callback: (payload: RealtimePayload<T>) => void,
    filter?: { column: string; value: any }
  ): RealtimeSubscription {
    const channelName = `${table}_${filter ? `${filter.column}_${filter.value}` : 'all'}`;
    
    // Check if subscription already exists
    if (this.subscriptions.has(channelName)) {
      const channel = this.subscriptions.get(channelName)!;
      this.addEventHandler(channelName, callback);
      return {
        channel,
        unsubscribe: () => this.removeEventHandler(channelName, callback),
      };
    }

    // Create new subscription
    let channel = supabase.channel(channelName);

    if (filter) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        callback
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        callback
      );
    }

    channel.subscribe((status) => {
      console.log(`Realtime subscription status for ${channelName}:`, status);
    });

    this.subscriptions.set(channelName, channel);
    this.addEventHandler(channelName, callback);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromTable(channelName, callback),
    };
  }

  /**
   * Subscribe to presence (user activity)
   */
  subscribeToPresence(
    room: string,
    userInfo: { user_id: string; name: string; role?: string },
    onJoin?: (user: any) => void,
    onLeave?: (user: any) => void
  ): RealtimeSubscription {
    const channelName = `presence_${room}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userInfo.user_id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence sync:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        if (onJoin) onJoin({ key, presences: newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        if (onLeave) onLeave({ key, presences: leftPresences });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo);
        }
      });

    this.subscriptions.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeFromTable(channelName),
    };
  }

  /**
   * Broadcast custom events
   */
  broadcast(channel: string, event: string, payload: any) {
    const channelInstance = this.subscriptions.get(channel);
    if (channelInstance) {
      channelInstance.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }

  /**
   * Subscribe to broadcast events
   */
  subscribeToBroadcast(
    channel: string,
    event: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `broadcast_${channel}`;
    
    const channelInstance = supabase.channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe();

    this.subscriptions.set(channelName, channelInstance);

    return {
      channel: channelInstance,
      unsubscribe: () => this.unsubscribeFromTable(channelName),
    };
  }

  /**
   * Unsubscribe from table
   */
  private unsubscribeFromTable(channelName: string, callback?: Function) {
    if (callback) {
      this.removeEventHandler(channelName, callback);
      // Don't unsubscribe if there are still handlers
      if (this.eventHandlers.get(channelName)?.size || 0 > 0) {
        return;
      }
    }

    const channel = this.subscriptions.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(channelName);
      this.eventHandlers.delete(channelName);
    }
  }

  /**
   * Add event handler
   */
  private addEventHandler(channelName: string, handler: Function) {
    if (!this.eventHandlers.has(channelName)) {
      this.eventHandlers.set(channelName, new Set());
    }
    this.eventHandlers.get(channelName)!.add(handler);
  }

  /**
   * Remove event handler
   */
  private removeEventHandler(channelName: string, handler: Function) {
    const handlers = this.eventHandlers.get(channelName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
    this.eventHandlers.clear();
  }
}

/**
 * React hooks for realtime functionality
 */

/**
 * Hook for subscribing to table changes
 */
export function useRealtimeTable<T>(
  table: string,
  filter?: { column: string; value: any }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRealtimeEvent = useCallback((payload: RealtimePayload<T>) => {
    console.log(`Realtime event for ${table}:`, payload);
    
    setData((currentData) => {
      switch (payload.eventType) {
        case 'INSERT':
          return [...currentData, payload.new];
        case 'UPDATE':
          return currentData.map((item: any) =>
            item.id === payload.new.id ? payload.new : item
          );
        case 'DELETE':
          return currentData.filter((item: any) => item.id !== payload.old.id);
        default:
          return currentData;
      }
    });
  }, [table]);

  useEffect(() => {
    const realtimeManager = RealtimeManager.getInstance();
    
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        let query = supabase.from(table).select('*');
        
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }
        
        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(initialData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to realtime changes
    const subscription = realtimeManager.subscribeToTable(
      table,
      handleRealtimeEvent,
      filter
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter?.column, filter?.value, handleRealtimeEvent]);

  return { data, loading, error, setData };
}

/**
 * Hook for presence (user activity)
 */
export function usePresence(
  room: string,
  userInfo: { user_id: string; name: string; role?: string }
) {
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const realtimeManager = RealtimeManager.getInstance();

    const subscription = realtimeManager.subscribeToPresence(
      room,
      userInfo,
      (joinData) => {
        setPresenceState((current) => ({
          ...current,
          [joinData.key]: joinData.presences,
        }));
      },
      (leaveData) => {
        setPresenceState((current) => {
          const updated = { ...current };
          delete updated[leaveData.key];
          return updated;
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [room, userInfo.user_id, userInfo.name, userInfo.role]);

  useEffect(() => {
    const users = Object.entries(presenceState).map(([key, presences]: [string, any]) => ({
      user_id: key,
      ...presences[0],
    }));
    setOnlineUsers(users);
  }, [presenceState]);

  return { onlineUsers, presenceState };
}

/**
 * Hook for broadcasting and receiving custom events
 */
export function useBroadcast(channel: string) {
  const [messages, setMessages] = useState<any[]>([]);

  const broadcast = useCallback((event: string, payload: any) => {
    const realtimeManager = RealtimeManager.getInstance();
    realtimeManager.broadcast(channel, event, payload);
  }, [channel]);

  const subscribe = useCallback((event: string, callback: (payload: any) => void) => {
    const realtimeManager = RealtimeManager.getInstance();
    return realtimeManager.subscribeToBroadcast(channel, event, callback);
  }, [channel]);

  return { messages, broadcast, subscribe };
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();
