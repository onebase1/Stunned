'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Building2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { ClientService } from '@/lib/supabase-service';

export default function JourneyPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await ClientService.getAll();
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
      // Fallback to mock data
      setClients([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          stage: 'Negotiation',
          property: 'Luxury Villa - Sunset Heights',
          value: 850000,
          lastActivity: '2024-01-15',
          nextAction: 'Follow up on counter offer',
          daysInStage: 3,
          probability: 75
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1 (555) 234-5678',
          stage: 'Viewing',
          property: 'Downtown Condo - City Center',
          value: 520000,
          lastActivity: '2024-01-14',
          nextAction: 'Schedule property viewing',
          daysInStage: 5,
          probability: 60
        },
        {
          id: 3,
          name: 'Michael Davis',
          email: 'mike.davis@email.com',
          phone: '+1 (555) 345-6789',
          stage: 'Contract',
          property: 'Family Home - Green Valley',
          value: 675000,
          lastActivity: '2024-01-13',
          nextAction: 'Review contract terms',
          daysInStage: 2,
          probability: 90
        },
        {
          id: 4,
          name: 'Emily Wilson',
          email: 'emily.w@email.com',
          phone: '+1 (555) 456-7890',
          stage: 'Qualified',
          property: 'Investment Property - Marina District',
          value: 420000,
          lastActivity: '2024-01-12',
          nextAction: 'Send property recommendations',
          daysInStage: 7,
          probability: 45
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for client journey stages
  const stages = [
    { name: 'Lead', count: 45, color: 'bg-blue-500' },
    { name: 'Qualified', count: 31, color: 'bg-green-500' },
    { name: 'Viewing', count: 24, color: 'bg-yellow-500' },
    { name: 'Negotiation', count: 18, color: 'bg-orange-500' },
    { name: 'Contract', count: 12, color: 'bg-purple-500' },
    { name: 'Closed', count: 9, color: 'bg-gray-500' }
  ];



  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-blue-100 text-blue-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Viewing': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalValue = clients.reduce((sum, client) => sum + client.value, 0);
  const avgDealSize = totalValue / clients.length;

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
            <h1 className="text-3xl font-bold text-gray-900">Client Journey</h1>
            <p className="text-gray-600">Track client progress through sales stages</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Pipeline Active
            </Badge>
          </div>
        </div>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {stages.map((stage, index) => (
                <div key={stage.name} className="text-center">
                  <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold text-lg">{stage.count}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                  <p className="text-xs text-gray-500">
                    {index < stages.length - 1 && (
                      <span>{Math.round((stage.count / stages[0].count) * 100)}% conversion</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Pipeline Flow */}
            <div className="flex items-center justify-between mb-4">
              {stages.map((stage, index) => (
                <div key={stage.name} className="flex items-center">
                  <div className={`w-3 h-3 ${stage.color} rounded-full`}></div>
                  {index < stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-600">Total Pipeline Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${(avgDealSize / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-600">Average Deal Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((stages[stages.length - 1].count / stages[0].count) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Overall Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{client.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {client.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Property</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {client.property}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Value</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${(client.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Days in Stage</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {client.daysInStage} days
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Probability</p>
                          <p className={`text-sm font-medium ${getProbabilityColor(client.probability)}`}>
                            {client.probability}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStageColor(client.stage)}>
                              {client.stage}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Next: {client.nextAction}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Update Stage
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
