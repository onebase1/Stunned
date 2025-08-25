'use client';

import React, { useEffect, useState } from 'react';
import { useRealtimeTable } from '@/lib/supabase-realtime';
import { toast } from 'sonner';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Notification {
  id: string;
  client_id: string;
  notification_type: 'payment_due' | 'appointment' | 'follow_up' | 'construction_update' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed';
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
}

interface RealtimeNotificationsProps {
  userId: string;
  showToasts?: boolean;
  maxVisible?: number;
}

export default function RealtimeNotifications({ 
  userId, 
  showToasts = true, 
  maxVisible = 5 
}: RealtimeNotificationsProps) {
  const { data: notifications, loading } = useRealtimeTable<Notification>('notifications');
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filter and sort notifications
  useEffect(() => {
    if (notifications.length > 0) {
      // Filter for current user and sort by priority and date
      const userNotifications = notifications
        .filter(n => n.status !== 'dismissed')
        .sort((a, b) => {
          // Sort by priority first
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setVisibleNotifications(userNotifications.slice(0, maxVisible));
      setUnreadCount(userNotifications.filter(n => n.status === 'unread').length);

      // Show toast for new urgent notifications
      if (showToasts) {
        const newUrgentNotifications = userNotifications.filter(
          n => n.priority === 'urgent' && n.status === 'unread'
        );

        newUrgentNotifications.forEach(notification => {
          toast.error(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => markAsRead(notification.id),
            },
          });
        });
      }
    }
  }, [notifications, maxVisible, showToasts]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // This would typically update the database
      // For now, we'll update local state
      setVisibleNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'read' as const } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId: string) => {
    try {
      // This would typically update the database
      // For now, we'll update local state
      setVisibleNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      setUnreadCount(prev => {
        const notification = visibleNotifications.find(n => n.id === notificationId);
        return notification?.status === 'unread' ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setVisibleNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: Notification['notification_type'], priority: Notification['priority']) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-600' :
      priority === 'high' ? 'text-orange-600' :
      priority === 'medium' ? 'text-yellow-600' :
      'text-blue-600'
    }`;

    switch (type) {
      case 'payment_due':
        return <AlertTriangle className={iconClass} />;
      case 'appointment':
        return <Clock className={iconClass} />;
      case 'follow_up':
        return <Bell className={iconClass} />;
      case 'construction_update':
        return <Info className={iconClass} />;
      case 'alert':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No new notifications at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-all duration-200 ${
              notification.status === 'unread' 
                ? 'border-l-4 border-l-blue-500 bg-blue-50/50' 
                : 'border-l-4 border-l-transparent'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.notification_type, notification.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getPriorityColor(notification.priority)}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        {notification.scheduled_date && (
                          <span className="text-xs text-gray-500">
                            • Due: {new Date(notification.scheduled_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {notification.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        title="Dismiss"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show more indicator */}
      {notifications.length > maxVisible && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            View all notifications ({notifications.length - maxVisible} more)
          </Button>
        </div>
      )}
    </div>
  );
}
