'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  Calendar,
  Star,
  Eye,
  Edit,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Users,
  Award
} from 'lucide-react';
import LeadCaptureForm from './LeadCaptureForm';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  leadSource: string;
  currentStage: string;
  priorityLevel: string;
  assignedAgent?: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  leadScore?: number;
  tags?: string[];
}

export default function LeadManagementDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockLeads: Lead[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      whatsappNumber: '+1-555-0101',
      budgetMin: 400000,
      budgetMax: 600000,
      preferredLocation: 'Downtown',
      leadSource: 'website',
      currentStage: 'LEAD',
      priorityLevel: 'medium',
      assignedAgent: 'Sarah Johnson',
      createdAt: '2024-08-20T10:30:00Z',
      lastContactDate: '2024-08-20T10:30:00Z',
      nextFollowUpDate: '2024-08-25T14:00:00Z',
      leadScore: 75,
      tags: ['first-time-buyer', 'downtown']
    },
    {
      id: '2',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0102',
      budgetMin: 500000,
      budgetMax: 750000,
      preferredLocation: 'Suburbs',
      leadSource: 'referral',
      currentStage: 'QUALIFIED',
      priorityLevel: 'high',
      assignedAgent: 'Michael Brown',
      createdAt: '2024-08-21T15:45:00Z',
      lastContactDate: '2024-08-21T15:45:00Z',
      nextFollowUpDate: '2024-08-26T11:00:00Z',
      leadScore: 92,
      tags: ['family', 'suburbs', 'qualified']
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@email.com',
      phone: '+1-555-0110',
      budgetMin: 280000,
      budgetMax: 400000,
      preferredLocation: 'Suburbs',
      leadSource: 'whatsapp',
      currentStage: 'LEAD',
      priorityLevel: 'low',
      assignedAgent: 'David Lee',
      createdAt: '2024-08-21T13:10:00Z',
      lastContactDate: '2024-08-21T13:10:00Z',
      nextFollowUpDate: '2024-08-28T09:00:00Z',
      leadScore: 45,
      tags: ['first-time-buyer', 'budget-conscious']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeads(mockLeads);
      setFilteredLeads(mockLeads);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.preferredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter
    if (selectedSource !== 'all') {
      filtered = filtered.filter(lead => lead.leadSource === selectedSource);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(lead => lead.priorityLevel === selectedPriority);
    }

    // Agent filter
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(lead => lead.assignedAgent === selectedAgent);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, selectedSource, selectedPriority, selectedAgent]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'LEAD': return 'bg-yellow-100 text-yellow-800';
      case 'QUALIFIED': return 'bg-green-100 text-green-800';
      case 'PROPERTY_MATCHED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateLead = async (leadData: any) => {
    // Simulate API call
    const newLead: Lead = {
      id: Date.now().toString(),
      ...leadData,
      currentStage: 'LEAD',
      createdAt: new Date().toISOString(),
      leadScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
    };

    setLeads(prev => [newLead, ...prev]);
    setShowCreateForm(false);
  };

  const handleEditLead = async (leadData: any) => {
    // Simulate API call
    setLeads(prev => prev.map(lead => 
      lead.id === selectedLead?.id 
        ? { ...lead, ...leadData }
        : lead
    ));
    setShowEditForm(false);
    setSelectedLead(null);
  };

  const handleQualifyLead = (leadId: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, currentStage: 'QUALIFIED', leadScore: Math.min((lead.leadScore || 0) + 20, 100) }
        : lead
    ));
    toast({
      title: "Lead Qualified",
      description: "Lead has been moved to qualified stage.",
    });
  };

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.currentStage === 'LEAD').length,
    qualifiedLeads: leads.filter(lead => lead.currentStage === 'QUALIFIED').length,
    avgLeadScore: Math.round(leads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / leads.length) || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl font-bold">{stats.newLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold">{stats.qualifiedLeads}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgLeadScore}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-gray-600">Capture, qualify, and manage your leads</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <LeadCaptureForm
              onSubmit={handleCreateLead}
              onCancel={() => setShowCreateForm(false)}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                <SelectItem value="David Lee">David Lee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.preferredLocation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {lead.preferredLocation}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(lead.priorityLevel)}>
                        {lead.priorityLevel}
                      </Badge>
                      <Badge className={getStageColor(lead.currentStage)}>
                        {lead.currentStage}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {lead.budgetMin && lead.budgetMax && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${lead.budgetMin.toLocaleString()} - ${lead.budgetMax.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {lead.assignedAgent || 'Unassigned'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                    {lead.leadScore && (
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getLeadScoreColor(lead.leadScore)}`} />
                        Score: {lead.leadScore}
                      </div>
                    )}
                  </div>

                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lead.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lead.currentStage === 'LEAD' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQualifyLead(lead.id)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Qualify
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowEditForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSource !== 'all' || selectedPriority !== 'all' || selectedAgent !== 'all'
                ? 'Try adjusting your filters to see more leads.'
                : 'Get started by creating your first lead.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Lead
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Lead Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadCaptureForm
              initialData={selectedLead}
              onSubmit={handleEditLead}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedLead(null);
              }}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
