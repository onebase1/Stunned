'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Building2,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Edit,
  Phone,
  Mail
} from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  clientName: string;
  clientEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  contractValue: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed' | 'cancelled';
  createdDate: string;
  signedDate?: string;
  completionDate?: string;
  agent: string;
  paymentSchedule: PaymentSchedule[];
  milestones: Milestone[];
}

interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

interface DealTrackingProps {
  contracts: Contract[];
}

interface DealMetrics {
  totalDeals: number;
  activeDeals: number;
  completedDeals: number;
  totalValue: number;
  avgDealSize: number;
  conversionRate: number;
  avgClosingTime: number;
  monthlyTarget: number;
  monthlyProgress: number;
}

interface AgentPerformance {
  agent: string;
  dealsCount: number;
  totalValue: number;
  avgDealSize: number;
  conversionRate: number;
  avgClosingTime: number;
}

export default function DealTracking({ contracts }: DealTrackingProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedAgent, setSelectedAgent] = useState('all');

  // Calculate deal metrics
  const calculateMetrics = (): DealMetrics => {
    const totalDeals = contracts.length;
    const activeDeals = contracts.filter(c => ['signed', 'pending_signature'].includes(c.status)).length;
    const completedDeals = contracts.filter(c => c.status === 'completed').length;
    const totalValue = contracts.reduce((sum, c) => sum + c.contractValue, 0);
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const conversionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;
    
    // Calculate average closing time for completed deals
    const completedContracts = contracts.filter(c => c.status === 'completed' && c.signedDate && c.completionDate);
    const avgClosingTime = completedContracts.length > 0 
      ? completedContracts.reduce((sum, c) => {
          const signedDate = new Date(c.signedDate!);
          const completedDate = new Date(c.completionDate!);
          const diffTime = completedDate.getTime() - signedDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / completedContracts.length
      : 0;

    const monthlyTarget = 5000000; // $5M monthly target
    const monthlyProgress = (totalValue / monthlyTarget) * 100;

    return {
      totalDeals,
      activeDeals,
      completedDeals,
      totalValue,
      avgDealSize,
      conversionRate,
      avgClosingTime,
      monthlyTarget,
      monthlyProgress
    };
  };

  // Calculate agent performance
  const calculateAgentPerformance = (): AgentPerformance[] => {
    const agentMap = new Map<string, Contract[]>();
    
    contracts.forEach(contract => {
      if (!agentMap.has(contract.agent)) {
        agentMap.set(contract.agent, []);
      }
      agentMap.get(contract.agent)!.push(contract);
    });

    return Array.from(agentMap.entries()).map(([agent, agentContracts]) => {
      const dealsCount = agentContracts.length;
      const totalValue = agentContracts.reduce((sum, c) => sum + c.contractValue, 0);
      const avgDealSize = dealsCount > 0 ? totalValue / dealsCount : 0;
      const completedDeals = agentContracts.filter(c => c.status === 'completed').length;
      const conversionRate = dealsCount > 0 ? (completedDeals / dealsCount) * 100 : 0;
      
      const completedContracts = agentContracts.filter(c => c.status === 'completed' && c.signedDate && c.completionDate);
      const avgClosingTime = completedContracts.length > 0 
        ? completedContracts.reduce((sum, c) => {
            const signedDate = new Date(c.signedDate!);
            const completedDate = new Date(c.completionDate!);
            const diffTime = completedDate.getTime() - signedDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }, 0) / completedContracts.length
        : 0;

      return {
        agent,
        dealsCount,
        totalValue,
        avgDealSize,
        conversionRate,
        avgClosingTime
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  };

  const metrics = calculateMetrics();
  const agentPerformance = calculateAgentPerformance();

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const getTrendIcon = (value: number, target: number) => {
    if (value > target) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < target * 0.8) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const dealsByStatus = [
    { status: 'Draft', count: contracts.filter(c => c.status === 'draft').length, color: 'bg-gray-500' },
    { status: 'Pending Signature', count: contracts.filter(c => c.status === 'pending_signature').length, color: 'bg-yellow-500' },
    { status: 'Signed', count: contracts.filter(c => c.status === 'signed').length, color: 'bg-blue-500' },
    { status: 'Completed', count: contracts.filter(c => c.status === 'completed').length, color: 'bg-green-500' },
    { status: 'Cancelled', count: contracts.filter(c => c.status === 'cancelled').length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Deal Tracking & Performance
          </h2>
          <p className="text-gray-600">Monitor deal progress, performance metrics, and sales targets</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deal Value</p>
                <p className="text-2xl font-bold">{formatPrice(metrics.totalValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(metrics.monthlyProgress, 100)}
                  <span className="text-xs text-gray-600">
                    {Math.round(metrics.monthlyProgress)}% of target
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold">{metrics.activeDeals}</p>
                <p className="text-xs text-blue-600">{metrics.totalDeals} total deals</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{Math.round(metrics.conversionRate)}%</p>
                <p className="text-xs text-purple-600">{metrics.completedDeals} completed</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold">{formatPrice(metrics.avgDealSize)}</p>
                <p className="text-xs text-orange-600">{Math.round(metrics.avgClosingTime)} days avg</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Target Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Target: {formatPrice(metrics.monthlyTarget)}</span>
              <span className="text-sm font-medium">Current: {formatPrice(metrics.totalValue)}</span>
            </div>
            <Progress value={Math.min(metrics.monthlyProgress, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="text-center">
              <span className={`text-lg font-bold ${
                metrics.monthlyProgress >= 100 ? 'text-green-600' :
                metrics.monthlyProgress >= 75 ? 'text-blue-600' :
                metrics.monthlyProgress >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(metrics.monthlyProgress)}% Complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Pipeline & Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Deal Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dealsByStatus.map((stage) => (
                <div key={stage.status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.status}</span>
                    <span className="text-sm font-bold">{stage.count} deals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${stage.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(stage.count / metrics.totalDeals) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Pipeline Value</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(metrics.totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformance.slice(0, 4).map((agent, index) => (
                <div key={agent.agent} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{agent.agent}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{agent.dealsCount} deals</span>
                      <span>{formatPrice(agent.totalValue)}</span>
                      <span>{Math.round(agent.conversionRate)}% conversion</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatPrice(agent.avgDealSize)}</div>
                    <div className="text-xs text-gray-500">avg deal</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent High-Value Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            High-Value Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts
              .filter(c => c.contractValue >= 2000000)
              .sort((a, b) => b.contractValue - a.contractValue)
              .slice(0, 5)
              .map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{contract.propertyTitle}</h4>
                      <p className="text-sm text-gray-600">{contract.clientName} • {contract.agent}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(contract.contractValue)}
                    </div>
                    <Badge className={
                      contract.status === 'completed' ? 'bg-green-100 text-green-800' :
                      contract.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {contract.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
