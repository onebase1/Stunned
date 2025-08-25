'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Target, 
  Award,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface StageMetrics {
  stage: string;
  displayName: string;
  clientCount: number;
  avgDaysInStage: number;
  conversionRate: number;
  dropOffRate: number;
  targetDays: number;
  bottleneck: boolean;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export default function JourneyPerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const stageMetrics: StageMetrics[] = [
    {
      stage: 'LEAD',
      displayName: 'New Leads',
      clientCount: 45,
      avgDaysInStage: 2.3,
      conversionRate: 68,
      dropOffRate: 32,
      targetDays: 3,
      bottleneck: false,
      trend: 'up',
      trendPercentage: 12
    },
    {
      stage: 'QUALIFIED',
      displayName: 'Qualified',
      clientCount: 31,
      avgDaysInStage: 5.8,
      conversionRate: 78,
      dropOffRate: 22,
      targetDays: 7,
      bottleneck: false,
      trend: 'up',
      trendPercentage: 8
    },
    {
      stage: 'PROPERTY_MATCHED',
      displayName: 'Property Matched',
      clientCount: 24,
      avgDaysInStage: 8.2,
      conversionRate: 85,
      dropOffRate: 15,
      targetDays: 5,
      bottleneck: true,
      trend: 'down',
      trendPercentage: 5
    },
    {
      stage: 'VIEWING',
      displayName: 'Viewing',
      clientCount: 20,
      avgDaysInStage: 12.5,
      conversionRate: 72,
      dropOffRate: 28,
      targetDays: 10,
      bottleneck: true,
      trend: 'stable',
      trendPercentage: 0
    },
    {
      stage: 'NEGOTIATION',
      displayName: 'Negotiation',
      clientCount: 14,
      avgDaysInStage: 18.3,
      conversionRate: 68,
      dropOffRate: 32,
      targetDays: 14,
      bottleneck: true,
      trend: 'down',
      trendPercentage: 15
    },
    {
      stage: 'CONTRACT',
      displayName: 'Contract',
      clientCount: 10,
      avgDaysInStage: 4.2,
      conversionRate: 92,
      dropOffRate: 8,
      targetDays: 7,
      bottleneck: false,
      trend: 'up',
      trendPercentage: 18
    }
  ];

  const agentPerformance = [
    {
      agentName: 'Sarah Johnson',
      clientsManaged: 28,
      avgConversionTime: 32,
      conversionRate: 85,
    },
    {
      agentName: 'Michael Brown',
      clientsManaged: 24,
      avgConversionTime: 38,
      conversionRate: 78,
    },
    {
      agentName: 'Lisa Chen',
      clientsManaged: 22,
      avgConversionTime: 35,
      conversionRate: 82,
    },
    {
      agentName: 'David Lee',
      clientsManaged: 18,
      avgConversionTime: 42,
      conversionRate: 72,
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const overallMetrics = {
    totalClients: stageMetrics.reduce((sum, stage) => sum + stage.clientCount, 0),
    avgConversionRate: Math.round(stageMetrics.reduce((sum, stage) => sum + stage.conversionRate, 0) / stageMetrics.length),
    avgJourneyTime: Math.round(stageMetrics.reduce((sum, stage) => sum + stage.avgDaysInStage, 0)),
    bottleneckCount: stageMetrics.filter(stage => stage.bottleneck).length,
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Journey Performance Analytics
          </h2>
          <p className="text-gray-600">Track and optimize client journey performance across all stages</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{overallMetrics.totalClients}</p>
                <p className="text-xs text-green-600">+8% from last period</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold">{overallMetrics.avgConversionRate}%</p>
                <p className="text-xs text-green-600">+3% from last period</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Journey Time</p>
                <p className="text-2xl font-bold">{overallMetrics.avgJourneyTime} days</p>
                <p className="text-xs text-red-600">+2 days from target</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bottlenecks</p>
                <p className="text-2xl font-bold">{overallMetrics.bottleneckCount}</p>
                <p className="text-xs text-yellow-600">Requires attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          <div className="grid gap-4">
            {stageMetrics.map((stage) => (
              <Card key={stage.stage} className={stage.bottleneck ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{stage.displayName}</h4>
                        <Badge variant="outline">{stage.clientCount} clients</Badge>
                        {stage.bottleneck && (
                          <Badge variant="destructive">Bottleneck</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Avg Days</p>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{stage.avgDaysInStage}</span>
                            <span className="text-gray-500">/ {stage.targetDays} target</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Conversion Rate</p>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{stage.conversionRate}%</span>
                            {getTrendIcon(stage.trend)}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Drop-off Rate</p>
                          <span className="font-medium text-red-600">{stage.dropOffRate}%</span>
                        </div>
                        <div>
                          <p className="text-gray-600">Trend</p>
                          <span className={`font-medium ${getTrendColor(stage.trend)}`}>
                            {stage.trend === 'stable' ? 'Stable' : `${stage.trendPercentage}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-48">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{stage.conversionRate}%</span>
                      </div>
                      <Progress value={stage.conversionRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Performance Trends Chart</h3>
                  <p className="text-gray-600">Time series analysis will be displayed here</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-2 rounded">
                      <p className="font-medium">This Week</p>
                      <p className="text-green-600">22 conversions</p>
                      <p className="text-orange-600">35 avg days</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="font-medium">Last Week</p>
                      <p className="text-green-600">18 conversions</p>
                      <p className="text-orange-600">38 avg days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {agentPerformance.map((agent) => (
              <Card key={agent.agentName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {agent.agentName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{agent.clientsManaged} clients</Badge>
                      <Badge className={agent.conversionRate >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {agent.conversionRate}% conversion
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Performance Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Clients Managed:</span>
                          <span className="font-medium">{agent.clientsManaged}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Conversion Time:</span>
                          <span className="font-medium">{agent.avgConversionTime} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium text-green-600">{agent.conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3">Performance Rating</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Performance:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={agent.conversionRate} className="w-16 h-2" />
                            <span className="font-medium w-6">{agent.conversionRate}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Speed:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.max(0, 100 - agent.avgConversionTime)} className="w-16 h-2" />
                            <span className="font-medium w-6">{Math.max(0, 100 - agent.avgConversionTime)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-3">Quick Actions</h5>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Assign Clients
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
