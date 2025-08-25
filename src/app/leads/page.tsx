'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  Phone,
  Mail,
  Calendar,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  UserPlus,
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch real clients and map to lead cards
        const res = await fetch('/api/clients');
        if (res.ok) {
          const payload = await res.json();
          const rows = payload?.data ?? [];
          const mapped = rows.map((c: any) => {
            const stage = (c.current_stage || '').toUpperCase();
            const status = stage === 'LEAD' ? 'New' : stage === 'QUALIFIED' ? 'Qualified' : 'Contacted';
            // Derive a plausible score from priority and recency
            const priorityBoost = (c.priority_level === 'high' ? 10 : c.priority_level === 'medium' ? 5 : 0);
            const daysSince = c.last_contact_date ? Math.max(0, Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (1000*60*60*24))) : 14;
            const recency = Math.max(0, 15 - Math.min(15, daysSince)); // 0..15
            const base = 65 + priorityBoost + Math.round(recency * 1.0);
            const score = Math.min(95, Math.max(50, base));
            const fmt = (n: number) => n?.toLocaleString('en-US');
            return ({
              id: c.id,
              name: `${c.first_name} ${c.last_name}`,
              email: c.email,
              phone: c.phone,
              source: c.lead_source || 'Unknown',
              status,
              score,
              lastContact: c.last_contact_date || c.updated_at,
              interestedIn: c.preferred_location || '—',
              budget: (c.budget_min && c.budget_max) ? `$${fmt(c.budget_min)} - $${fmt(c.budget_max)}` : '—',
            });
          });
          setLeads(mapped);
        } else {
          setLeads([]);
        }
      } catch (e) {
        console.error('Load leads failed', e);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fallback mock data if no leads
  const defaultLeads = [

    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      source: 'Website',
      status: 'New',
      score: 85,
      lastContact: '2024-01-15',
      interestedIn: 'Luxury Villa',
      budget: '$750,000 - $1,000,000'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      source: 'Referral',
      status: 'Qualified',
      score: 92,
      lastContact: '2024-01-14',
      interestedIn: 'Downtown Condo',
      budget: '$400,000 - $600,000'
    },
    {
      id: 3,
      name: 'Michael Davis',
      email: 'mike.davis@email.com',
      phone: '+1 (555) 345-6789',
      source: 'Social Media',
      status: 'Contacted',
      score: 78,
      lastContact: '2024-01-13',
      interestedIn: 'Family Home',
      budget: '$500,000 - $750,000'
    },
    {
      id: 4,
      name: 'Emily Wilson',
      email: 'emily.w@email.com',
      phone: '+1 (555) 456-7890',
      source: 'Advertisement',
      status: 'New',
      score: 65,
      lastContact: '2024-01-12',
      interestedIn: 'Investment Property',
      budget: '$300,000 - $500,000'
    }
  ];

  const effectiveLeads = leads.length ? leads : defaultLeads;

  const stats = {
    totalLeads: effectiveLeads.length,
    newLeads: effectiveLeads.filter(lead => lead.status === 'New').length,
    qualifiedLeads: effectiveLeads.filter(lead => lead.status === 'Qualified').length,
    avgScore: Math.round(
      (effectiveLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / Math.max(1, effectiveLeads.length))
    )
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600">Capture, score, and nurture your leads effectively</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.newLeads}</p>
                  <p className="text-xs text-blue-600">This week</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.qualifiedLeads}</p>
                  <p className="text-xs text-green-600">Ready for contact</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.avgScore}</p>
                  <p className="text-xs text-yellow-600">Lead quality</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
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
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Lead</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Interest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">Budget: {lead.budget}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{lead.source}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{lead.interestedIn}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
