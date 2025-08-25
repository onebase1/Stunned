'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Camera,
  FileText,
  Users,
  MessageSquare,
  Plus
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  progress: number;
  contractor: string;
  photos: number;
  notes: string[];
  issues: number;
  dependencies?: string[];
}

interface ConstructionTimelineProps {
  propertyId: string;
  propertyName: string;
  milestones: Milestone[];
  onUpdateMilestone?: (milestoneId: string, updates: Partial<Milestone>) => void;
  editable?: boolean;
}

const mockMilestones: Milestone[] = [
  {
    id: '1',
    name: 'Foundation',
    description: 'Excavation, foundation pouring, and curing',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    actualEndDate: '2024-01-12',
    progress: 100,
    contractor: 'Elite Construction Co.',
    photos: 8,
    notes: ['Foundation completed 2 days ahead of schedule', 'Quality inspection passed'],
    issues: 0
  },
  {
    id: '2',
    name: 'Structural Framework',
    description: 'Steel framework and concrete structure',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-02-12',
    actualEndDate: '2024-02-10',
    progress: 100,
    contractor: 'Elite Construction Co.',
    photos: 12,
    notes: ['All structural elements installed', 'Engineering inspection completed'],
    issues: 0
  },
  {
    id: '3',
    name: 'Roofing',
    description: 'Roof installation and waterproofing',
    status: 'completed',
    startDate: '2024-02-13',
    endDate: '2024-02-27',
    actualEndDate: '2024-02-25',
    progress: 100,
    contractor: 'Elite Construction Co.',
    photos: 6,
    notes: ['Waterproofing completed', 'Weather protection installed'],
    issues: 0
  },
  {
    id: '4',
    name: 'Electrical & Plumbing',
    description: 'Electrical wiring and plumbing installation',
    status: 'in_progress',
    startDate: '2024-02-28',
    endDate: '2024-03-20',
    progress: 75,
    contractor: 'Elite Construction Co.',
    photos: 4,
    notes: ['Electrical rough-in completed', 'Plumbing installation 80% complete'],
    issues: 1
  },
  {
    id: '5',
    name: 'Insulation & Drywall',
    description: 'Insulation installation and drywall finishing',
    status: 'pending',
    startDate: '2024-03-21',
    endDate: '2024-04-10',
    progress: 0,
    contractor: 'Elite Construction Co.',
    photos: 0,
    notes: [],
    issues: 0,
    dependencies: ['4']
  },
  {
    id: '6',
    name: 'Flooring',
    description: 'Flooring installation throughout the property',
    status: 'pending',
    startDate: '2024-04-11',
    endDate: '2024-04-25',
    progress: 0,
    contractor: 'Elite Construction Co.',
    photos: 0,
    notes: [],
    issues: 0,
    dependencies: ['5']
  },
  {
    id: '7',
    name: 'Interior Finishing',
    description: 'Paint, fixtures, and final interior work',
    status: 'pending',
    startDate: '2024-04-26',
    endDate: '2024-05-24',
    progress: 0,
    contractor: 'Elite Construction Co.',
    photos: 0,
    notes: [],
    issues: 0,
    dependencies: ['6']
  },
  {
    id: '8',
    name: 'Final Inspection',
    description: 'Final inspection and handover preparation',
    status: 'pending',
    startDate: '2024-05-25',
    endDate: '2024-05-31',
    progress: 0,
    contractor: 'Elite Construction Co.',
    photos: 0,
    notes: [],
    issues: 0,
    dependencies: ['7']
  }
];

export default function ConstructionTimeline({
  propertyId,
  propertyName,
  milestones = mockMilestones,
  onUpdateMilestone,
  editable = false
}: ConstructionTimelineProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showPhotos, setShowPhotos] = useState<string | null>(null);

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'delayed':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (milestone: Milestone) => {
    if (milestone.status === 'completed') return false;
    const endDate = new Date(milestone.endDate);
    const today = new Date();
    return today > endDate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Construction Timeline</h2>
          <p className="text-gray-600">{propertyName}</p>
        </div>
        {editable && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                {getStatusIcon(milestone.status)}
              </div>

              {/* Milestone card */}
              <Card className={`flex-1 ${selectedMilestone === milestone.id ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {milestone.name}
                        <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue(milestone) && milestone.status !== 'completed' && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMilestone(
                        selectedMilestone === milestone.id ? null : milestone.id
                      )}
                    >
                      {selectedMilestone === milestone.id ? 'Collapse' : 'Details'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-blue-500' :
                          milestone.status === 'delayed' ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Basic info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <p className="font-medium">{formatDate(milestone.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <p className="font-medium">{formatDate(milestone.endDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium">
                        {calculateDuration(milestone.startDate, milestone.endDate)} days
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Contractor:</span>
                      <p className="font-medium">{milestone.contractor}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-1" />
                      Photos ({milestone.photos})
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Notes ({milestone.notes.length})
                    </Button>
                    {milestone.issues > 0 && (
                      <Button variant="outline" size="sm" className="text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Issues ({milestone.issues})
                      </Button>
                    )}
                  </div>

                  {/* Expanded details */}
                  {selectedMilestone === milestone.id && (
                    <div className="border-t pt-4 space-y-4">
                      {/* Notes */}
                      {milestone.notes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <div className="space-y-2">
                            {milestone.notes.map((note, noteIndex) => (
                              <div key={noteIndex} className="p-2 bg-gray-50 rounded text-sm">
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dependencies */}
                      {milestone.dependencies && milestone.dependencies.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Dependencies</h4>
                          <div className="flex gap-2">
                            {milestone.dependencies.map((depId) => {
                              const depMilestone = milestones.find(m => m.id === depId);
                              return depMilestone ? (
                                <Badge key={depId} variant="outline" className="text-xs">
                                  {depMilestone.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Actual completion date */}
                      {milestone.actualEndDate && (
                        <div>
                          <h4 className="font-medium mb-2">Actual Completion</h4>
                          <p className="text-sm">
                            {formatDate(milestone.actualEndDate)}
                            {milestone.actualEndDate < milestone.endDate && (
                              <span className="text-green-600 ml-2">
                                (Completed early)
                              </span>
                            )}
                            {milestone.actualEndDate > milestone.endDate && (
                              <span className="text-red-600 ml-2">
                                (Completed late)
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {editable && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm">Update Progress</Button>
                          <Button variant="outline" size="sm">Add Note</Button>
                          <Button variant="outline" size="sm">Upload Photos</Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {milestones.filter(m => m.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {milestones.filter(m => m.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {milestones.filter(m => isOverdue(m) && m.status !== 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
