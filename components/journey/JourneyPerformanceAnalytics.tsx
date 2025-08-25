'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Recharts imports - temporarily commented out for dev server
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   FunnelChart,
//   Funnel,
//   LabelList
// } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Target, 
  Award,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
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

interface ConversionFunnelData {
  stage: string;
  clients: number;
  conversionRate: number;
  fill: string;
}

interface TimeSeriesData {
  date: string;
  conversions: number;
  avgDays: number;
  clientCount: number;
}

interface AgentPerformance {
  agentName: string;
  clientsManaged: number;
  avgConversionTime: number;
  conversionRate: number;
  currentStageDistribution: Record<string, number>;
}

export default function JourneyPerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('conversion_rate');
  const [stageMetrics, setStageMetrics] = useState<StageMetrics[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockStageMetrics: StageMetrics[] = [
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
    },
    {
      stage: 'PAYMENT_SETUP',
      displayName: 'Payment Setup',
      clientCount: 9,
      avgDaysInStage: 3.1,
      conversionRate: 95,
      dropOffRate: 5,
      targetDays: 5,
      bottleneck: false,
      trend: 'stable',
      trendPercentage: 2
    },
    {
      stage: 'CONSTRUCTION',
      displayName: 'Construction',
      clientCount: 8,
      avgDaysInStage: 120.5,
      conversionRate: 98,
      dropOffRate: 2,
      targetDays: 180,
      bottleneck: false,
      trend: 'up',
      trendPercentage: 3
    },
    {
      stage: 'HANDOVER',
      displayName: 'Handover',
      clientCount: 8,
      avgDaysInStage: 1.8,
      conversionRate: 100,
      dropOffRate: 0,
      targetDays: 3,
      bottleneck: false,
      trend: 'stable',
      trendPercentage: 0
    }
  ];

  const mockFunnelData: ConversionFunnelData[] = [
    { stage: 'LEAD', clients: 45, conversionRate: 100, fill: '#fbbf24' },
    { stage: 'QUALIFIED', clients: 31, conversionRate: 68, fill: '#10b981' },
    { stage: 'PROPERTY_MATCHED', clients: 24, conversionRate: 77, fill: '#3b82f6' },
    { stage: 'VIEWING', clients: 20, conversionRate: 83, fill: '#8b5cf6' },
    { stage: 'NEGOTIATION', clients: 14, conversionRate: 70, fill: '#f97316' },
    { stage: 'CONTRACT', clients: 10, conversionRate: 71, fill: '#6366f1' },
    { stage: 'PAYMENT_SETUP', clients: 9, conversionRate: 90, fill: '#ec4899' },
    { stage: 'CONSTRUCTION', clients: 8, conversionRate: 89, fill: '#06b6d4' },
    { stage: 'HANDOVER', clients: 8, conversionRate: 100, fill: '#10b981' }
  ];

  const mockTimeSeriesData: TimeSeriesData[] = [
    { date: '2024-07-25', conversions: 12, avgDays: 45, clientCount: 156 },
    { date: '2024-08-01', conversions: 15, avgDays: 42, clientCount: 162 },
    { date: '2024-08-08', conversions: 18, avgDays: 38, clientCount: 168 },
    { date: '2024-08-15', conversions: 14, avgDays: 41, clientCount: 171 },
    { date: '2024-08-22', conversions: 22, avgDays: 35, clientCount: 178 },
  ];

  const mockAgentPerformance: AgentPerformance[] = [
    {
      agentName: 'Sarah Johnson',
      clientsManaged: 28,
      avgConversionTime: 32,
      conversionRate: 85,
      currentStageDistribution: { 'LEAD': 5, 'QUALIFIED': 8, 'VIEWING': 6, 'NEGOTIATION': 4, 'CONTRACT': 3, 'CONSTRUCTION': 2 }
    },
    {
      agentName: 'Michael Brown',
      clientsManaged: 24,
      avgConversionTime: 38,
      conversionRate: 78,
      currentStageDistribution: { 'LEAD': 4, 'QUALIFIED': 6, 'VIEWING': 5, 'NEGOTIATION': 3, 'CONTRACT': 2, 'PAYMENT_SETUP': 2, 'CONSTRUCTION': 2 }
    },
    {
      agentName: 'Lisa Chen',
      clientsManaged: 22,
      avgConversionTime: 35,
      conversionRate: 82,
      currentStageDistribution: { 'LEAD': 3, 'QUALIFIED': 5, 'PROPERTY_MATCHED': 4, 'VIEWING': 3, 'NEGOTIATION': 2, 'CONTRACT': 2, 'CONSTRUCTION': 3 }
    },
    {
      agentName: 'David Lee',
      clientsManaged: 18,
      avgConversionTime: 42,
      conversionRate: 72,
      currentStageDistribution: { 'LEAD': 6, 'QUALIFIED': 4, 'PROPERTY_MATCHED': 3, 'VIEWING': 2, 'NEGOTIATION': 2, 'CONTRACT': 1 }
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStageMetrics(mockStageMetrics);
      setFunnelData(mockFunnelData);
      setTimeSeriesData(mockTimeSeriesData);
      setAgentPerformance(mockAgentPerformance);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading performance analytics...</p>
        </div>
      </div>
    );
  }

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
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
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

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Conversion Funnel Chart</h3>
                  <p className="text-gray-600">Interactive funnel visualization will be displayed here</p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    {funnelData.slice(0, 3).map((stage, index) => (
                      <div key={index} className="bg-white p-2 rounded">
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-blue-600">{stage.clients} clients</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    {timeSeriesData.slice(-2).map((data, index) => (
                      <div key={index} className="bg-white p-2 rounded">
                        <p className="font-medium">{data.date}</p>
                        <p className="text-green-600">{data.conversions} conversions</p>
                        <p className="text-orange-600">{data.avgDays} avg days</p>
                      </div>
                    ))}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <h5 className="font-medium mb-3">Current Stage Distribution</h5>
                      <div className="space-y-2">
                        {Object.entries(agent.currentStageDistribution).map(([stage, count]) => (
                          <div key={stage} className="flex items-center justify-between text-sm">
                            <span>{stage}:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={(count / agent.clientsManaged) * 100} className="w-16 h-2" />
                              <span className="font-medium w-6">{count}</span>
                            </div>
                          </div>
                        ))}
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
