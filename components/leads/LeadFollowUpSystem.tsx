'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  User, 
  AlertCircle,
  CheckCircle,
  Plus,
  Bell,
  Send,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'task';
  subject: string;
  description: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  reminderSent?: boolean;
}

interface LeadFollowUpSystemProps {
  leadId?: string;
  onFollowUpComplete?: (followUpId: string) => void;
}

export default function LeadFollowUpSystem({ leadId, onFollowUpComplete }: LeadFollowUpSystemProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUp[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [newFollowUp, setNewFollowUp] = useState({
    leadId: leadId || '',
    leadName: '',
    type: 'call' as const,
    subject: '',
    description: '',
    scheduledDate: '',
    priority: 'medium' as const,
    assignedTo: '',
  });

  // Mock data
  const mockFollowUps: FollowUp[] = [
    {
      id: '1',
      leadId: '1',
      leadName: 'John Smith',
      type: 'call',
      subject: 'Initial qualification call',
      description: 'Call to understand budget and requirements better',
      scheduledDate: '2024-08-25T14:00:00Z',
      status: 'pending',
      priority: 'high',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-08-20T10:30:00Z',
      reminderSent: false,
    },
    {
      id: '2',
      leadId: '2',
      leadName: 'Emily Davis',
      type: 'email',
      subject: 'Send property recommendations',
      description: 'Send curated list of properties matching her criteria',
      scheduledDate: '2024-08-24T09:00:00Z',
      status: 'overdue',
      priority: 'high',
      assignedTo: 'Michael Brown',
      createdAt: '2024-08-21T15:45:00Z',
      reminderSent: true,
    },
    {
      id: '3',
      leadId: '3',
      leadName: 'Sarah Williams',
      type: 'whatsapp',
      subject: 'Follow up on budget discussion',
      description: 'Check if she has finalized her budget range',
      scheduledDate: '2024-08-28T10:00:00Z',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'David Lee',
      createdAt: '2024-08-21T13:10:00Z',
      reminderSent: false,
    },
    {
      id: '4',
      leadId: '1',
      leadName: 'John Smith',
      type: 'meeting',
      subject: 'Property viewing appointment',
      description: 'Schedule viewing for Heritage Tower A - Unit 301',
      scheduledDate: '2024-08-22T15:30:00Z',
      status: 'completed',
      priority: 'high',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-08-20T10:30:00Z',
      completedAt: '2024-08-22T15:30:00Z',
      notes: 'Client showed strong interest. Discussed financing options.',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFollowUps(mockFollowUps);
      setFilteredFollowUps(mockFollowUps);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = followUps;

    // Apply leadId filter if provided
    if (leadId) {
      filtered = filtered.filter(followUp => followUp.leadId === leadId);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(followUp =>
        followUp.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(followUp => followUp.priority === priorityFilter);
    }

    setFilteredFollowUps(filtered);
  }, [followUps, leadId, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'whatsapp': return MessageSquare;
      case 'meeting': return Calendar;
      case 'task': return CheckCircle;
      default: return Clock;
    }
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date() && scheduledDate !== '';
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const followUp: FollowUp = {
        id: Date.now().toString(),
        ...newFollowUp,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reminderSent: false,
      };

      setFollowUps(prev => [followUp, ...prev]);
      setShowCreateForm(false);
      setNewFollowUp({
        leadId: leadId || '',
        leadName: '',
        type: 'call',
        subject: '',
        description: '',
        scheduledDate: '',
        priority: 'medium',
        assignedTo: '',
      });

      toast({
        title: "Follow-up Created",
        description: "Follow-up has been scheduled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create follow-up. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteFollowUp = (followUpId: string, notes?: string) => {
    setFollowUps(prev => prev.map(followUp => 
      followUp.id === followUpId 
        ? { 
            ...followUp, 
            status: 'completed' as const, 
            completedAt: new Date().toISOString(),
            notes: notes || followUp.notes
          }
        : followUp
    ));

    if (onFollowUpComplete) {
      onFollowUpComplete(followUpId);
    }

    toast({
      title: "Follow-up Completed",
      description: "Follow-up has been marked as completed.",
    });
  };

  const handleDeleteFollowUp = (followUpId: string) => {
    setFollowUps(prev => prev.filter(followUp => followUp.id !== followUpId));
    toast({
      title: "Follow-up Deleted",
      description: "Follow-up has been deleted successfully.",
    });
  };

  const stats = {
    total: followUps.length,
    pending: followUps.filter(f => f.status === 'pending').length,
    overdue: followUps.filter(f => f.status === 'overdue' || (f.status === 'pending' && isOverdue(f.scheduledDate))).length,
    completed: followUps.filter(f => f.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading follow-ups...</p>
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
                <p className="text-sm font-medium text-gray-600">Total Follow-ups</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Follow-up Management</h2>
          <p className="text-gray-600">Schedule and track lead follow-ups</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadName">Lead Name</Label>
                  <Input
                    id="leadName"
                    placeholder="Enter lead name"
                    value={newFollowUp.leadName}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, leadName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Follow-up Type</Label>
                  <Select value={newFollowUp.type} onValueChange={(value: any) => setNewFollowUp(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter follow-up subject"
                  value={newFollowUp.subject}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter follow-up description"
                  value={newFollowUp.description}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={newFollowUp.scheduledDate}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newFollowUp.priority} onValueChange={(value: any) => setNewFollowUp(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select value={newFollowUp.assignedTo} onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                      <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                      <SelectItem value="David Lee">David Lee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule Follow-up
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      {!leadId && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search follow-ups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups List */}
      <div className="grid gap-4">
        {filteredFollowUps.map((followUp) => {
          const TypeIcon = getTypeIcon(followUp.type);
          const isFollowUpOverdue = followUp.status === 'pending' && isOverdue(followUp.scheduledDate);
          
          return (
            <Card key={followUp.id} className={`hover:shadow-md transition-shadow ${isFollowUpOverdue ? 'border-red-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{followUp.subject}</h3>
                          <p className="text-sm text-gray-600">{followUp.leadName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                        <Badge className={getStatusColor(isFollowUpOverdue ? 'overdue' : followUp.status)}>
                          {isFollowUpOverdue ? 'overdue' : followUp.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-2">{followUp.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(followUp.scheduledDate).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {followUp.assignedTo}
                      </div>
                      {followUp.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Completed {new Date(followUp.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {followUp.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {followUp.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {followUp.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteFollowUp(followUp.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedFollowUp(followUp);
                        setShowEditForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFollowUp(followUp.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFollowUps.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No follow-ups found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more follow-ups.'
                : 'Get started by scheduling your first follow-up.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
