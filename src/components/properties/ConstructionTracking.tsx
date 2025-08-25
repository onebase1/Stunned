'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Calendar, 
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  MapPin,
  DollarSign,
  Hammer,
  Truck,
  HardHat,
  FileText,
  Camera,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: 'apartment' | 'villa' | 'townhouse' | 'penthouse';
  status: 'available' | 'reserved' | 'sold' | 'under_construction';
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  constructionProgress?: number;
  completionDate?: string;
  agent: string;
}

interface ConstructionMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
}

interface ConstructionProject {
  property: Property;
  milestones: ConstructionMilestone[];
  contractor: string;
  projectManager: string;
  startDate: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  budget: number;
  spent: number;
  issues: number;
  lastUpdate: string;
}

interface ConstructionTrackingProps {
  properties: Property[];
}

export default function ConstructionTracking({ properties }: ConstructionTrackingProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Mock construction data
  const constructionProjects: ConstructionProject[] = properties.map(property => ({
    property,
    contractor: 'Heritage Construction Ltd',
    projectManager: 'Ahmed Hassan',
    startDate: '2024-06-01',
    estimatedCompletion: property.completionDate || '2024-12-31',
    budget: property.price * 0.7, // Assume construction cost is 70% of sale price
    spent: property.price * 0.7 * (property.constructionProgress || 0) / 100,
    issues: Math.floor(Math.random() * 3),
    lastUpdate: '2024-08-24T14:30:00Z',
    milestones: [
      {
        id: '1',
        name: 'Foundation',
        description: 'Foundation and basement construction',
        targetDate: '2024-07-15',
        completedDate: '2024-07-12',
        status: 'completed',
        progress: 100
      },
      {
        id: '2',
        name: 'Structure',
        description: 'Main structure and framework',
        targetDate: '2024-09-01',
        status: 'in_progress',
        progress: 85
      },
      {
        id: '3',
        name: 'MEP Installation',
        description: 'Mechanical, Electrical, and Plumbing',
        targetDate: '2024-10-15',
        status: 'pending',
        progress: 0
      },
      {
        id: '4',
        name: 'Interior Finishing',
        description: 'Interior work and finishing touches',
        targetDate: '2024-11-30',
        status: 'pending',
        progress: 0
      },
      {
        id: '5',
        name: 'Final Inspection',
        description: 'Final inspection and handover preparation',
        targetDate: '2024-12-15',
        status: 'pending',
        progress: 0
      }
    ]
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const overallStats = {
    totalProjects: constructionProjects.length,
    onSchedule: constructionProjects.filter(p => 
      calculateDaysRemaining(p.estimatedCompletion) > 0
    ).length,
    delayed: constructionProjects.filter(p => 
      calculateDaysRemaining(p.estimatedCompletion) < 0
    ).length,
    avgProgress: constructionProjects.reduce((sum, p) => 
      sum + (p.property.constructionProgress || 0), 0
    ) / constructionProjects.length,
    totalBudget: constructionProjects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: constructionProjects.reduce((sum, p) => sum + p.spent, 0),
    totalIssues: constructionProjects.reduce((sum, p) => sum + p.issues, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Construction Tracking
          </h2>
          <p className="text-gray-600">Monitor construction progress, milestones, and project timelines</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Activity className="h-3 w-3 mr-1" />
            {overallStats.totalProjects} Active Projects
          </Badge>
          <Button>
            <Camera className="h-4 w-4 mr-2" />
            Site Photos
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{overallStats.totalProjects}</p>
                <p className="text-xs text-blue-600">{overallStats.onSchedule} on schedule</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{Math.round(overallStats.avgProgress)}%</p>
                <p className="text-xs text-green-600">Across all projects</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Status</p>
                <p className="text-2xl font-bold">
                  {Math.round((overallStats.totalSpent / overallStats.totalBudget) * 100)}%
                </p>
                <p className="text-xs text-purple-600">
                  {formatPrice(overallStats.totalSpent)} / {formatPrice(overallStats.totalBudget)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Issues</p>
                <p className="text-2xl font-bold">{overallStats.totalIssues}</p>
                <p className="text-xs text-red-600">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Construction Projects */}
      <div className="space-y-4">
        {constructionProjects.map((project) => {
          const daysRemaining = calculateDaysRemaining(project.estimatedCompletion);
          const isDelayed = daysRemaining < 0;
          const budgetUsed = (project.spent / project.budget) * 100;
          
          return (
            <Card 
              key={project.property.id} 
              className={`${isDelayed ? 'border-red-200 bg-red-50' : ''} hover:shadow-md transition-shadow`}
            >
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {project.property.title}
                        {isDelayed && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.property.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{project.projectManager}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hammer className="h-4 w-4" />
                          <span>{project.contractor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        project.property.constructionProgress! >= 90 ? 'text-green-600' :
                        project.property.constructionProgress! >= 70 ? 'text-blue-600' :
                        project.property.constructionProgress! >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {project.property.constructionProgress}%
                      </div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-lg font-bold ${isDelayed ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(daysRemaining)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isDelayed ? 'days overdue' : 'days left'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Construction Progress</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{project.property.constructionProgress}%</span>
                        </div>
                        <Progress value={project.property.constructionProgress} className="h-2" />
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Budget Utilization</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget Used</span>
                          <span className="font-medium">{Math.round(budgetUsed)}%</span>
                        </div>
                        <Progress value={budgetUsed} className="h-2" />
                        <div className="text-xs text-gray-600">
                          {formatPrice(project.spent)} / {formatPrice(project.budget)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Timeline Status</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Completion Date</span>
                          <Badge className={isDelayed ? getStatusColor('delayed') : getStatusColor('in_progress')}>
                            {new Date(project.estimatedCompletion).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Started: {new Date(project.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Construction Milestones</h5>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedProject(
                          selectedProject === project.property.id ? null : project.property.id
                        )}
                      >
                        {selectedProject === project.property.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {project.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="relative">
                          <div className={`p-3 rounded-lg border-2 ${
                            milestone.status === 'completed' ? 'border-green-200 bg-green-50' :
                            milestone.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                            milestone.status === 'delayed' ? 'border-red-200 bg-red-50' :
                            'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                                milestone.status === 'completed' ? 'bg-green-500' :
                                milestone.status === 'in_progress' ? 'bg-blue-500' :
                                milestone.status === 'delayed' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}>
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                ) : (
                                  <span className="text-white text-xs font-bold">{index + 1}</span>
                                )}
                              </div>
                              <h6 className="text-xs font-medium mb-1">{milestone.name}</h6>
                              <div className="text-xs text-gray-600">
                                {milestone.progress}%
                              </div>
                            </div>
                          </div>
                          
                          {index < project.milestones.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-1 w-2 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed View */}
                  {selectedProject === project.property.id && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-3">Milestone Details</h5>
                          <div className="space-y-3">
                            {project.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  milestone.status === 'completed' ? 'bg-green-500' :
                                  milestone.status === 'in_progress' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}>
                                  {milestone.status === 'completed' ? (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h6 className="font-medium text-sm">{milestone.name}</h6>
                                    <Badge className={getStatusColor(milestone.status)}>
                                      {milestone.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{milestone.description}</p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                                    <span className="font-medium">{milestone.progress}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-3">Project Actions</h5>
                          <div className="space-y-2">
                            <Button size="sm" className="w-full justify-start">
                              <Camera className="h-4 w-4 mr-2" />
                              Upload Site Photos
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              Progress Report
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <Bell className="h-4 w-4 mr-2" />
                              Set Reminder
                            </Button>
                            <Button size="sm" variant="outline" className="w-full justify-start">
                              <Users className="h-4 w-4 mr-2" />
                              Contact Team
                            </Button>
                          </div>
                          
                          {project.issues > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-800">
                                  {project.issues} Active Issue{project.issues > 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-sm text-red-700">
                                Issues require immediate attention to prevent delays.
                              </p>
                              <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                                View Issues
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {constructionProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No construction projects</h3>
          <p className="text-gray-600">All properties are completed or no construction projects are active.</p>
        </div>
      )}
    </div>
  );
}
