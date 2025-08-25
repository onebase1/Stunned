'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  MessageSquare,
  Home,
  FileText,
  CreditCard,
  Building,
  Award,
  Plus
} from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  currentStage: string;
  priorityLevel: string;
  assignedAgent?: string;
  leadScore?: number;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  daysInStage?: number;
  avatar?: string;
  tags?: string[];
}

interface JourneyStage {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  clients: Client[];
  targetDays: number;
  conversionRate: number;
}

interface ClientJourneyPipelineProps {
  onStageChange?: (clientId: string, newStage: string, oldStage: string) => void;
  onClientSelect?: (client: Client) => void;
}

export default function ClientJourneyPipeline({ onStageChange, onClientSelect }: ClientJourneyPipelineProps) {
  const [stages, setStages] = useState<JourneyStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  // Journey stages configuration
  const stageConfig: Omit<JourneyStage, 'clients'>[] = [
    {
      id: 'LEAD',
      name: 'LEAD',
      displayName: 'New Leads',
      description: 'Initial inquiries and new prospects',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      icon: User,
      targetDays: 3,
      conversionRate: 65,
    },
    {
      id: 'QUALIFIED',
      name: 'QUALIFIED',
      displayName: 'Qualified',
      description: 'Budget verified and requirements confirmed',
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: CheckCircle,
      targetDays: 7,
      conversionRate: 78,
    },
    {
      id: 'PROPERTY_MATCHED',
      name: 'PROPERTY_MATCHED',
      displayName: 'Property Matched',
      description: 'Properties identified and matched to client needs',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: Home,
      targetDays: 5,
      conversionRate: 85,
    },
    {
      id: 'VIEWING',
      name: 'VIEWING',
      displayName: 'Viewing',
      description: 'Property viewings scheduled or completed',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      icon: Eye,
      targetDays: 10,
      conversionRate: 72,
    },
    {
      id: 'NEGOTIATION',
      name: 'NEGOTIATION',
      displayName: 'Negotiation',
      description: 'Price and terms negotiation in progress',
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      icon: TrendingUp,
      targetDays: 14,
      conversionRate: 68,
    },
    {
      id: 'CONTRACT',
      name: 'CONTRACT',
      displayName: 'Contract',
      description: 'Contract preparation and signing',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      icon: FileText,
      targetDays: 7,
      conversionRate: 92,
    },
    {
      id: 'PAYMENT_SETUP',
      name: 'PAYMENT_SETUP',
      displayName: 'Payment Setup',
      description: 'Payment plans and financing arrangements',
      color: 'bg-pink-100 border-pink-300 text-pink-800',
      icon: CreditCard,
      targetDays: 5,
      conversionRate: 95,
    },
    {
      id: 'CONSTRUCTION',
      name: 'CONSTRUCTION',
      displayName: 'Construction',
      description: 'Property under construction or completion',
      color: 'bg-cyan-100 border-cyan-300 text-cyan-800',
      icon: Building,
      targetDays: 180,
      conversionRate: 98,
    },
    {
      id: 'HANDOVER',
      name: 'HANDOVER',
      displayName: 'Handover',
      description: 'Property ready for handover to client',
      color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
      icon: Award,
      targetDays: 3,
      conversionRate: 100,
    },
  ];

  // Mock client data - replace with actual API calls
  const mockClients: Client[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      budgetMin: 400000,
      budgetMax: 600000,
      preferredLocation: 'Downtown',
      currentStage: 'LEAD',
      priorityLevel: 'medium',
      assignedAgent: 'Sarah Johnson',
      leadScore: 75,
      lastContactDate: '2024-08-20T10:30:00Z',
      nextFollowUpDate: '2024-08-25T14:00:00Z',
      daysInStage: 2,
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
      currentStage: 'QUALIFIED',
      priorityLevel: 'high',
      assignedAgent: 'Michael Brown',
      leadScore: 92,
      lastContactDate: '2024-08-21T15:45:00Z',
      nextFollowUpDate: '2024-08-26T11:00:00Z',
      daysInStage: 5,
      tags: ['family', 'suburbs', 'qualified']
    },
    {
      id: '3',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1-555-0103',
      budgetMin: 800000,
      budgetMax: 1200000,
      preferredLocation: 'Waterfront',
      currentStage: 'CONTRACT',
      priorityLevel: 'high',
      assignedAgent: 'Sarah Johnson',
      leadScore: 95,
      lastContactDate: '2024-08-22T09:20:00Z',
      nextFollowUpDate: '2024-08-28T16:30:00Z',
      daysInStage: 3,
      tags: ['luxury', 'waterfront', 'contract']
    },
    {
      id: '4',
      firstName: 'James',
      lastName: 'Taylor',
      email: 'james.taylor@email.com',
      phone: '+1-555-0104',
      budgetMin: 600000,
      budgetMax: 900000,
      preferredLocation: 'Midtown',
      currentStage: 'CONSTRUCTION',
      priorityLevel: 'medium',
      assignedAgent: 'Lisa Chen',
      leadScore: 88,
      lastContactDate: '2024-08-19T14:15:00Z',
      nextFollowUpDate: '2024-08-27T10:30:00Z',
      daysInStage: 45,
      tags: ['modern', 'midtown', 'construction']
    },
    {
      id: '5',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      email: 'maria.rodriguez@email.com',
      phone: '+1-555-0106',
      budgetMin: 350000,
      budgetMax: 500000,
      preferredLocation: 'Downtown',
      currentStage: 'VIEWING',
      priorityLevel: 'medium',
      assignedAgent: 'Lisa Chen',
      leadScore: 78,
      lastContactDate: '2024-08-23T14:30:00Z',
      nextFollowUpDate: '2024-08-26T10:00:00Z',
      daysInStage: 8,
      tags: ['pet-friendly', 'viewing']
    },
    {
      id: '6',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@email.com',
      phone: '+1-555-0107',
      budgetMin: 750000,
      budgetMax: 1000000,
      preferredLocation: 'Uptown',
      currentStage: 'NEGOTIATION',
      priorityLevel: 'high',
      assignedAgent: 'Sarah Johnson',
      leadScore: 85,
      lastContactDate: '2024-08-24T09:15:00Z',
      nextFollowUpDate: '2024-08-25T15:00:00Z',
      daysInStage: 12,
      tags: ['home-office', 'negotiation']
    }
  ];

  useEffect(() => {
    // Simulate API call to load clients and organize by stage
    setTimeout(() => {
      const stagesWithClients = stageConfig.map(stage => ({
        ...stage,
        clients: mockClients.filter(client => client.currentStage === stage.id)
      }));
      
      setStages(stagesWithClients);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDragStart = (start: any) => {
    const client = stages
      .flatMap(stage => stage.clients)
      .find(client => client.id === start.draggableId);
    setDraggedClient(client || null);
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedClient(null);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    // Find the client being moved
    const sourceStage = stages.find(stage => stage.id === source.droppableId);
    const destinationStage = stages.find(stage => stage.id === destination.droppableId);
    const client = sourceStage?.clients.find(c => c.id === draggableId);

    if (!sourceStage || !destinationStage || !client) return;

    // Update stages
    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) {
        return {
          ...stage,
          clients: stage.clients.filter(c => c.id !== draggableId)
        };
      }
      if (stage.id === destination.droppableId) {
        const updatedClient = {
          ...client,
          currentStage: destination.droppableId,
          daysInStage: 0 // Reset days in new stage
        };
        return {
          ...stage,
          clients: [...stage.clients, updatedClient]
        };
      }
      return stage;
    });

    setStages(newStages);

    // Notify parent component
    if (onStageChange) {
      onStageChange(draggableId, destination.droppableId, source.droppableId);
    }

    toast({
      title: "Stage Updated",
      description: `${client.firstName} ${client.lastName} moved to ${destinationStage.displayName}`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isOverdue = (daysInStage: number, targetDays: number) => {
    return daysInStage > targetDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading client journey pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Client Journey Pipeline</h2>
          <p className="text-gray-600">Drag and drop clients between stages to update their journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {stages.reduce((sum, stage) => sum + stage.clients.length, 0)} Total Clients
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {Math.round(stages.reduce((sum, stage) => sum + stage.conversionRate, 0) / stages.length)}% Avg Conversion
          </Badge>
        </div>
      </div>

      {/* Pipeline Stages */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-x-auto">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const overdueCounts = stage.clients.filter(client => 
              isOverdue(client.daysInStage || 0, stage.targetDays)
            ).length;

            return (
              <div key={stage.id} className="min-w-80 lg:min-w-0">
                <Card className={`${stage.color} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-sm font-medium">
                          {stage.displayName}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stage.clients.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs opacity-75">{stage.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Target: {stage.targetDays} days</span>
                        <span>{stage.conversionRate}% conversion</span>
                      </div>
                      {overdueCounts > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-xs">{overdueCounts} overdue</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`mt-2 space-y-2 min-h-32 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'bg-blue-50 border-2 border-blue-300 border-dashed' 
                          : 'bg-gray-50'
                      }`}
                    >
                      {stage.clients.map((client, index) => (
                        <Draggable key={client.id} draggableId={client.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-all hover:shadow-md border-l-4 ${getPriorityColor(client.priorityLevel)} ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              } ${isOverdue(client.daysInStage || 0, stage.targetDays) ? 'bg-red-50' : 'bg-white'}`}
                              onClick={() => onClientSelect && onClientSelect(client)}
                            >
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-sm">
                                        {client.firstName} {client.lastName}
                                      </h4>
                                      <p className="text-xs text-gray-600">{client.email}</p>
                                    </div>
                                    {client.leadScore && (
                                      <Badge variant="outline" className={`text-xs ${getScoreColor(client.leadScore)}`}>
                                        {client.leadScore}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="space-y-1 text-xs text-gray-600">
                                    {client.budgetMin && client.budgetMax && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        ${client.budgetMin.toLocaleString()} - ${client.budgetMax.toLocaleString()}
                                      </div>
                                    )}
                                    {client.preferredLocation && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {client.preferredLocation}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {client.daysInStage} days in stage
                                      {isOverdue(client.daysInStage || 0, stage.targetDays) && (
                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                      )}
                                    </div>
                                    {client.assignedAgent && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {client.assignedAgent}
                                      </div>
                                    )}
                                  </div>

                                  {client.tags && client.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {client.tags.slice(0, 2).map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs px-1 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {client.tags.length > 2 && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          +{client.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {stage.clients.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No clients in this stage</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pipeline Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {stages.reduce((sum, stage) => sum + stage.clients.length, 0)}
              </p>
              <p className="text-sm text-blue-700">Total Active Clients</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(stages.reduce((sum, stage) => sum + stage.conversionRate, 0) / stages.length)}%
              </p>
              <p className="text-sm text-green-700">Average Conversion Rate</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stages.reduce((sum, stage) => 
                  sum + stage.clients.filter(client => 
                    isOverdue(client.daysInStage || 0, stage.targetDays)
                  ).length, 0
                )}
              </p>
              <p className="text-sm text-red-700">Overdue Clients</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
