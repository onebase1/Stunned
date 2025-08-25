'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  notes?: string;
}

interface JourneyStage {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  targetDays: number;
  clients: Client[];
}

interface ClientJourneyPipelineProps {
  onStageChange?: (clientId: string, newStage: string, oldStage: string) => void;
  onClientSelect?: (client: Client) => void;
}

export default function ClientJourneyPipeline({ onStageChange, onClientSelect }: ClientJourneyPipelineProps) {
  const [stages, setStages] = useState<JourneyStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the 9-stage journey pipeline
  const initialStages: JourneyStage[] = [
    {
      id: 'LEAD',
      name: 'LEAD',
      displayName: 'New Leads',
      description: 'Initial prospect capture',
      color: 'bg-yellow-100 border-yellow-300',
      icon: User,
      targetDays: 3,
      clients: []
    },
    {
      id: 'QUALIFIED',
      name: 'QUALIFIED',
      displayName: 'Qualified',
      description: 'Budget & requirements verified',
      color: 'bg-green-100 border-green-300',
      icon: CheckCircle,
      targetDays: 7,
      clients: []
    },
    {
      id: 'PROPERTY_MATCHED',
      name: 'PROPERTY_MATCHED',
      displayName: 'Property Matched',
      description: 'Properties identified & matched',
      color: 'bg-blue-100 border-blue-300',
      icon: Home,
      targetDays: 5,
      clients: []
    },
    {
      id: 'VIEWING',
      name: 'VIEWING',
      displayName: 'Viewing',
      description: 'Property tours scheduled',
      color: 'bg-purple-100 border-purple-300',
      icon: Eye,
      targetDays: 10,
      clients: []
    },
    {
      id: 'NEGOTIATION',
      name: 'NEGOTIATION',
      displayName: 'Negotiation',
      description: 'Price & terms discussion',
      color: 'bg-orange-100 border-orange-300',
      icon: TrendingUp,
      targetDays: 14,
      clients: []
    },
    {
      id: 'CONTRACT',
      name: 'CONTRACT',
      displayName: 'Contract',
      description: 'Agreement preparation',
      color: 'bg-indigo-100 border-indigo-300',
      icon: FileText,
      targetDays: 7,
      clients: []
    },
    {
      id: 'PAYMENT_SETUP',
      name: 'PAYMENT_SETUP',
      displayName: 'Payment Setup',
      description: 'Financing arrangements',
      color: 'bg-pink-100 border-pink-300',
      icon: CreditCard,
      targetDays: 5,
      clients: []
    },
    {
      id: 'CONSTRUCTION',
      name: 'CONSTRUCTION',
      displayName: 'Construction',
      description: 'Property development',
      color: 'bg-cyan-100 border-cyan-300',
      icon: Building,
      targetDays: 180,
      clients: []
    },
    {
      id: 'HANDOVER',
      name: 'HANDOVER',
      displayName: 'Handover',
      description: 'Final delivery',
      color: 'bg-emerald-100 border-emerald-300',
      icon: Award,
      targetDays: 3,
      clients: []
    }
  ];

  // Mock client data
  const mockClients: Client[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      budgetMin: 500000,
      budgetMax: 750000,
      preferredLocation: 'Manhattan, NY',
      currentStage: 'LEAD',
      priorityLevel: 'high',
      assignedAgent: 'Sarah Johnson',
      leadScore: 85,
      lastContactDate: '2024-08-24T10:30:00Z',
      daysInStage: 2,
      notes: 'Interested in luxury properties'
    },
    {
      id: '2',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 234-5678',
      budgetMin: 750000,
      budgetMax: 1000000,
      preferredLocation: 'Beverly Hills, CA',
      currentStage: 'QUALIFIED',
      priorityLevel: 'high',
      assignedAgent: 'Michael Brown',
      leadScore: 92,
      lastContactDate: '2024-08-24T09:15:00Z',
      daysInStage: 5,
      notes: 'Looking for family home with good schools'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@email.com',
      phone: '+1 (555) 345-6789',
      budgetMin: 300000,
      budgetMax: 500000,
      preferredLocation: 'Chicago, IL',
      currentStage: 'PROPERTY_MATCHED',
      priorityLevel: 'medium',
      assignedAgent: 'Lisa Chen',
      leadScore: 67,
      lastContactDate: '2024-08-23T11:30:00Z',
      daysInStage: 3,
      notes: 'First-time buyer'
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@email.com',
      phone: '+1 (555) 456-7890',
      budgetMin: 400000,
      budgetMax: 600000,
      preferredLocation: 'Miami, FL',
      currentStage: 'VIEWING',
      priorityLevel: 'medium',
      assignedAgent: 'David Lee',
      leadScore: 78,
      lastContactDate: '2024-08-24T08:15:00Z',
      daysInStage: 8,
      notes: 'Interested in waterfront properties'
    },
    {
      id: '5',
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@email.com',
      phone: '+1 (555) 567-8901',
      budgetMin: 1000000,
      budgetMax: 1500000,
      preferredLocation: 'San Francisco, CA',
      currentStage: 'NEGOTIATION',
      priorityLevel: 'high',
      assignedAgent: 'Sarah Johnson',
      leadScore: 95,
      lastContactDate: '2024-08-23T15:45:00Z',
      daysInStage: 12,
      notes: 'Luxury condo buyer'
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@email.com',
      phone: '+1 (555) 678-9012',
      budgetMin: 600000,
      budgetMax: 800000,
      preferredLocation: 'Seattle, WA',
      currentStage: 'CONTRACT',
      priorityLevel: 'high',
      assignedAgent: 'Michael Brown',
      leadScore: 88,
      lastContactDate: '2024-08-22T14:20:00Z',
      daysInStage: 4,
      notes: 'Ready to close'
    },
    {
      id: '7',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@email.com',
      phone: '+1 (555) 789-0123',
      budgetMin: 800000,
      budgetMax: 1200000,
      preferredLocation: 'Austin, TX',
      currentStage: 'PAYMENT_SETUP',
      priorityLevel: 'medium',
      assignedAgent: 'Lisa Chen',
      leadScore: 82,
      lastContactDate: '2024-08-21T16:30:00Z',
      daysInStage: 2,
      notes: 'Finalizing mortgage'
    },
    {
      id: '8',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '+1 (555) 890-1234',
      budgetMin: 450000,
      budgetMax: 650000,
      preferredLocation: 'Phoenix, AZ',
      currentStage: 'CONSTRUCTION',
      priorityLevel: 'low',
      assignedAgent: 'David Lee',
      leadScore: 75,
      lastContactDate: '2024-08-20T10:45:00Z',
      daysInStage: 45,
      notes: 'New construction project'
    }
  ];

  useEffect(() => {
    // Simulate API call and distribute clients across stages
    setTimeout(() => {
      const stagesWithClients = initialStages.map(stage => ({
        ...stage,
        clients: mockClients.filter(client => client.currentStage === stage.id)
      }));
      
      setStages(stagesWithClients);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStage = stages.find(stage => stage.id === source.droppableId);
    const destStage = stages.find(stage => stage.id === destination.droppableId);
    const client = sourceStage?.clients.find(c => c.id === draggableId);

    if (!sourceStage || !destStage || !client) return;

    // Update client's stage
    const updatedClient = { ...client, currentStage: destStage.id, daysInStage: 0 };

    // Update stages
    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) {
        return {
          ...stage,
          clients: stage.clients.filter(c => c.id !== draggableId)
        };
      }
      if (stage.id === destination.droppableId) {
        const newClients = [...stage.clients];
        newClients.splice(destination.index, 0, updatedClient);
        return {
          ...stage,
          clients: newClients
        };
      }
      return stage;
    });

    setStages(newStages);

    // Notify parent component
    if (onStageChange) {
      onStageChange(client.id, destStage.id, sourceStage.id);
    }

    toast({
      title: "Client Moved",
      description: `${client.firstName} ${client.lastName} moved to ${destStage.displayName}`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatCurrency = (min?: number, max?: number) => {
    if (!min && !max) return 'Budget TBD';
    const formatNum = (num: number) => `$${(num / 1000).toFixed(0)}K`;
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    return `Up to ${formatNum(max!)}`;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Journey Pipeline</h2>
          <p className="text-gray-600">Drag and drop clients between stages to update their journey</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isOverdue = stage.clients.some(client => 
              client.daysInStage && client.daysInStage > stage.targetDays
            );

            return (
              <div key={stage.id} className="min-w-80 lg:min-w-0">
                <Card className={`${stage.color} ${isOverdue ? 'ring-2 ring-red-400' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-sm font-medium">
                          {stage.displayName}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {stage.clients.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{stage.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Target: {stage.targetDays} days
                    </div>
                  </CardHeader>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-32 px-3 pb-3 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {stage.clients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                              >
                                <Card 
                                  className={`border-l-4 ${getPriorityColor(client.priorityLevel)} ${
                                    client.daysInStage && client.daysInStage > stage.targetDays 
                                      ? 'bg-red-50 border-red-200' 
                                      : 'bg-white hover:shadow-md'
                                  } transition-shadow cursor-pointer`}
                                  onClick={() => onClientSelect?.(client)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-medium text-blue-600">
                                            {client.firstName[0]}{client.lastName[0]}
                                          </span>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            {client.firstName} {client.lastName}
                                          </h4>
                                          <p className="text-xs text-gray-500">{client.assignedAgent}</p>
                                        </div>
                                      </div>
                                      {client.leadScore && (
                                        <div className="text-right">
                                          <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500" />
                                            <span className="text-xs font-medium">{client.leadScore}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>{formatCurrency(client.budgetMin, client.budgetMax)}</span>
                                      </div>
                                      {client.preferredLocation && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">{client.preferredLocation}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {client.daysInStage} days in stage
                                          {client.daysInStage && client.daysInStage > stage.targetDays && (
                                            <span className="text-red-600 ml-1">
                                              ({client.daysInStage - stage.targetDays} over)
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    {client.daysInStage && (
                                      <div className="mt-2">
                                        <Progress 
                                          value={Math.min((client.daysInStage / stage.targetDays) * 100, 100)} 
                                          className="h-1"
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
