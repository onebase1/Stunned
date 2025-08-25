'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  Send,
  Reply,
  Archive,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { InteractionService } from '@/lib/supabase-service';

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/communications');
      if (res.ok) {
        const payload = await res.json();
        const rows = payload?.data || payload || [];
        setCommunications(rows);
      } else {
        setCommunications([]);
      }
    } catch (err) {
      console.error('Error loading communications:', err);
      setError('Failed to load communications');
      // Fallback to mock data
      setCommunications([
        {
          id: 1,
          client_name: 'John Smith',
          interaction_type: 'Email',
          subject: 'Property Viewing Follow-up',
          message: 'Thank you for showing me the Sunset Heights villa. I\'m very interested and would like to discuss the next steps.',
          interaction_date: '2024-01-15T10:30:00Z',
          status: 'Unread',
          priority: 'High',
          response_required: true,
          property_name: 'Luxury Villa - Sunset Heights'
        },
        {
          id: 2,
          client_name: 'Sarah Johnson',
          interaction_type: 'Phone Call',
          subject: 'Financing Questions',
          message: 'Called to discuss financing options for the downtown condo. Left voicemail requesting callback.',
          interaction_date: '2024-01-14T14:15:00Z',
          status: 'Responded',
          priority: 'Medium',
          response_required: false,
          property_name: 'Downtown Condo - City Center'
        },
        {
          id: 3,
          client_name: 'Michael Davis',
          interaction_type: 'SMS',
          subject: 'Contract Update',
          message: 'Hi, just wanted to check on the status of our contract review. Any updates?',
          interaction_date: '2024-01-13T16:45:00Z',
          status: 'Read',
          priority: 'Medium',
          response_required: true,
          property_name: 'Family Home - Green Valley'
        },
        {
          id: 4,
          client_name: 'Emily Wilson',
          interaction_type: 'Email',
          subject: 'Investment Property Inquiry',
          message: 'I\'m interested in learning more about investment opportunities in the Marina District.',
          interaction_date: '2024-01-12T09:20:00Z',
          status: 'Responded',
          priority: 'Low',
          response_required: false,
          property_name: 'Investment Property - Marina District'
        },
        {
          id: 5,
          client_name: 'Robert Brown',
          interaction_type: 'Meeting',
          subject: 'Property Showing Scheduled',
          message: 'Scheduled property showing for this Saturday at 2 PM. Client confirmed attendance.',
          interaction_date: '2024-01-11T11:00:00Z',
          status: 'Scheduled',
          priority: 'High',
          response_required: false,
          property_name: 'Luxury Villa - Sunset Heights'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone call': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && comm.status === 'Unread') ||
                         (selectedFilter === 'responded' && comm.status === 'Responded') ||
                         (selectedFilter === 'high-priority' && comm.priority === 'High');
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalCommunications: communications.length,
    unreadCount: communications.filter(c => c.status === 'Unread').length,
    responseRequired: communications.filter(c => c.response_required).length,
    highPriority: communications.filter(c => c.priority === 'High').length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600">Manage client communications and interactions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCommunications}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.unreadCount}</p>
                </div>
                <Mail className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Required</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.responseRequired}</p>
                </div>
                <Reply className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.highPriority}</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedFilter === 'unread' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('unread')}
            >
              Unread
            </Button>
            <Button 
              variant={selectedFilter === 'responded' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('responded')}
            >
              Responded
            </Button>
            <Button 
              variant={selectedFilter === 'high-priority' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('high-priority')}
            >
              High Priority
            </Button>
          </div>
        </div>

        {/* Communications List */}
        <div className="space-y-4">
          {filteredCommunications.map((comm) => (
            <Card key={comm.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{comm.client_name}</h3>
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status}
                          </Badge>
                          <span className={`text-sm font-medium ${getPriorityColor(comm.priority)}`}>
                            {comm.priority} Priority
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            {getTypeIcon(comm.interaction_type)}
                            <span className="ml-1">{comm.interaction_type}</span>
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(comm.interaction_date).toLocaleDateString()} at {new Date(comm.interaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {comm.property_name && (
                            <span className="text-blue-600">{comm.property_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-13">
                      <h4 className="font-medium text-gray-900 mb-2">{comm.subject}</h4>
                      <p className="text-gray-600 text-sm mb-3">{comm.message}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        {comm.interaction_type === 'Phone Call' && (
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Call Back
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Archive className="h-3 w-3 mr-1" />
                          Archive
                        </Button>
                        {comm.response_required && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Response Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommunications.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
