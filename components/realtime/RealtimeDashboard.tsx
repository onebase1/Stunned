'use client';

import React, { useEffect, useState } from 'react';
import { useRealtimeTable, usePresence, useBroadcast } from '@/lib/supabase-realtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  Bell, 
  MessageSquare, 
  Eye,
  UserCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface RealtimeDashboardProps {
  userId: string;
  userName: string;
  userRole?: string;
}

export default function RealtimeDashboard({ userId, userName, userRole = 'agent' }: RealtimeDashboardProps) {
  // Realtime data subscriptions
  const { data: clients, loading: clientsLoading } = useRealtimeTable('clients');
  const { data: properties, loading: propertiesLoading } = useRealtimeTable('properties');
  const { data: interactions, loading: interactionsLoading } = useRealtimeTable('interactions');
  const { data: notifications, loading: notificationsLoading } = useRealtimeTable('notifications', {
    column: 'client_id',
    value: userId
  });

  // Presence tracking
  const { onlineUsers } = usePresence('dashboard', {
    user_id: userId,
    name: userName,
    role: userRole
  });

  // Broadcasting for collaborative features
  const { broadcast, subscribe } = useBroadcast('dashboard_updates');

  // Local state for real-time metrics
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    totalClients: 0,
    activeProperties: 0,
    todayInteractions: 0,
    unreadNotifications: 0,
    onlineAgents: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Update metrics when data changes
  useEffect(() => {
    if (!clientsLoading && !propertiesLoading && !interactionsLoading && !notificationsLoading) {
      const today = new Date().toDateString();
      
      setRealtimeMetrics({
        totalClients: clients.length,
        activeProperties: properties.filter((p: any) => p.available).length,
        todayInteractions: interactions.filter((i: any) => 
          new Date(i.interaction_date).toDateString() === today
        ).length,
        unreadNotifications: notifications.filter((n: any) => n.status === 'unread').length,
        onlineAgents: onlineUsers.length
      });
    }
  }, [clients, properties, interactions, notifications, onlineUsers, clientsLoading, propertiesLoading, interactionsLoading, notificationsLoading]);

  // Track recent activity
  useEffect(() => {
    const activities = [
      ...clients.slice(-5).map((c: any) => ({
        id: `client-${c.id}`,
        type: 'client',
        message: `New client: ${c.first_name} ${c.last_name}`,
        timestamp: c.created_at,
        icon: Users
      })),
      ...interactions.slice(-5).map((i: any) => ({
        id: `interaction-${i.id}`,
        type: 'interaction',
        message: `${i.interaction_type}: ${i.subject}`,
        timestamp: i.interaction_date,
        icon: MessageSquare
      })),
      ...properties.slice(-3).map((p: any) => ({
        id: `property-${p.id}`,
        type: 'property',
        message: `Property updated: ${p.property_name}`,
        timestamp: p.updated_at,
        icon: TrendingUp
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    setRecentActivity(activities);
  }, [clients, interactions, properties]);

  // Handle collaborative notifications
  useEffect(() => {
    const subscription = subscribe('user_action', (payload) => {
      console.log('Collaborative action received:', payload);
      // Handle collaborative actions like "User X is viewing Client Y"
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subscribe]);

  // Broadcast user actions
  const broadcastAction = (action: string, data: any) => {
    broadcast('user_action', {
      userId,
      userName,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  };

  if (clientsLoading || propertiesLoading || interactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with online users */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Real-time Dashboard</h1>
          <p className="text-gray-600">Live updates and collaborative features</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Online users indicator */}
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">{onlineUsers.length} online</span>
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((user, index) => (
                <div
                  key={user.user_id}
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{realtimeMetrics.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Properties</p>
                <p className="text-2xl font-bold">{realtimeMetrics.activeProperties}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Interactions</p>
                <p className="text-2xl font-bold">{realtimeMetrics.todayInteractions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold">{realtimeMetrics.unreadNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Agents</p>
                <p className="text-2xl font-bold">{realtimeMetrics.onlineAgents}</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time activity feed and notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Notifications
              {realtimeMetrics.unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {realtimeMetrics.unreadNotifications}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notification: any) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={notification.status === 'unread' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.status}
                  </Badge>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collaborative features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Team Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Real-time sync active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {onlineUsers.length} team member{onlineUsers.length !== 1 ? 's' : ''} online
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => broadcastAction('ping', { message: 'Hello team!' })}
            >
              Send Team Ping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
