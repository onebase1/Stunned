'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Plus,
  User,
  Target,
  Bell,
  Settings
} from 'lucide-react';

export default function LeadFollowUpSystem() {
  const [selectedTab, setSelectedTab] = useState('pending');

  const followUps = [
    {
      id: '1',
      leadName: 'John Smith',
      leadEmail: 'john.smith@email.com',
      type: 'call',
      scheduledDate: '2024-08-24T14:00:00Z',
      status: 'pending',
      priority: 'high',
      notes: 'Follow up on property viewing interest',
      assignedAgent: 'Sarah Johnson',
      leadScore: 85,
      daysOverdue: 0
    },
    {
      id: '2',
      leadName: 'Emily Davis',
      leadEmail: 'emily.davis@email.com',
      type: 'email',
      scheduledDate: '2024-08-24T10:00:00Z',
      status: 'overdue',
      priority: 'high',
      notes: 'Send property recommendations based on budget',
      assignedAgent: 'Michael Brown',
      leadScore: 92,
      daysOverdue: 2
    },
    {
      id: '3',
      leadName: 'Michael Johnson',
      leadEmail: 'michael.johnson@email.com',
      type: 'meeting',
      scheduledDate: '2024-08-25T15:30:00Z',
      status: 'scheduled',
      priority: 'medium',
      notes: 'In-person consultation for first-time buyer',
      assignedAgent: 'Lisa Chen',
      leadScore: 67,
      daysOverdue: 0
    },
    {
      id: '4',
      leadName: 'Sarah Williams',
      leadEmail: 'sarah.williams@email.com',
      type: 'call',
      scheduledDate: '2024-08-23T16:00:00Z',
      status: 'completed',
      priority: 'medium',
      notes: 'Discussed waterfront property options',
      assignedAgent: 'David Lee',
      leadScore: 78,
      daysOverdue: 0
    },
    {
      id: '5',
      leadName: 'Robert Brown',
      leadEmail: 'robert.brown@email.com',
      type: 'email',
      scheduledDate: '2024-08-22T09:00:00Z',
      status: 'overdue',
      priority: 'high',
      notes: 'Follow up on luxury condo inquiry',
      assignedAgent: 'Sarah Johnson',
      leadScore: 95,
      daysOverdue: 3
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredFollowUps = followUps.filter(followUp => {
    if (selectedTab === 'pending') return followUp.status === 'pending';
    if (selectedTab === 'overdue') return followUp.status === 'overdue';
    if (selectedTab === 'scheduled') return followUp.status === 'scheduled';
    if (selectedTab === 'completed') return followUp.status === 'completed';
    return true;
  });

  const stats = {
    pending: followUps.filter(f => f.status === 'pending').length,
    overdue: followUps.filter(f => f.status === 'overdue').length,
    scheduled: followUps.filter(f => f.status === 'scheduled').length,
    completed: followUps.filter(f => f.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Follow-Up System
          </h2>
          <p className="text-gray-600">Manage and track lead follow-up activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-blue-600">Ready for action</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-red-600">Requires immediate attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-green-600">Future appointments</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-gray-600">This week</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'overdue', label: 'Overdue', count: stats.overdue },
          { key: 'scheduled', label: 'Scheduled', count: stats.scheduled },
          { key: 'completed', label: 'Completed', count: stats.completed },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={selectedTab === tab.key ? 'default' : 'outline'}
            onClick={() => setSelectedTab(tab.key)}
            className="flex items-center gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredFollowUps.map((followUp) => (
          <Card 
            key={followUp.id} 
            className={`${
              followUp.status === 'overdue' ? 'border-red-200 bg-red-50' : ''
            } hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(followUp.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{followUp.leadName}</h4>
                      <p className="text-sm text-gray-600">{followUp.leadEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(followUp.status)}>
                        {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                      </Badge>
                      <Badge className={getPriorityColor(followUp.priority)}>
                        {followUp.priority.charAt(0).toUpperCase() + followUp.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(followUp.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{new Date(followUp.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{followUp.assignedAgent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className={`font-medium ${getScoreColor(followUp.leadScore)}`}>
                        Score: {followUp.leadScore}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">{followUp.notes}</p>
                  </div>
                  
                  {followUp.daysOverdue > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {followUp.daysOverdue} day{followUp.daysOverdue > 1 ? 's' : ''} overdue
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {followUp.status === 'pending' || followUp.status === 'overdue' ? (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </>
                  ) : followUp.status === 'scheduled' ? (
                    <>
                      <Button size="sm" variant="outline">
                        <Bell className="h-4 w-4 mr-1" />
                        Remind
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule Next
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFollowUps.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {selectedTab} follow-ups
          </h3>
          <p className="text-gray-600">
            {selectedTab === 'pending' && "All follow-ups are up to date!"}
            {selectedTab === 'overdue' && "Great! No overdue follow-ups."}
            {selectedTab === 'scheduled' && "No upcoming scheduled follow-ups."}
            {selectedTab === 'completed' && "No completed follow-ups to show."}
          </p>
        </div>
      )}
    </div>
  );
}
