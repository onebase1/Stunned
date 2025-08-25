'use client';

import Link from 'next/link';
import {
  Users,
  Building2,
  DollarSign,
  Calendar,
  ArrowRight,
  Activity,
  TrendingUp,
  Award,
  Target,
  Workflow,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/dashboard-layout';

export default function DashboardPage() {

  // Mock data for demonstration
  const stats = {
    quarterlyRevenue: 15750000,
    yearlyTarget: 35000000,
    totalPortfolioValue: 45000000,
    propertiesUnderConstruction: 12,
    marketShare: 12.5,
    clientSatisfaction: 4.8,
    customerRetention: 92,
    activeLeads: 24,
    conversionRate: 18.5,
    avgDealSize: 750000,
    upcomingHandovers: 8,
    agentPerformance: 87,
    avgClosingTime: 42,
  };

  const quickActions = [
    {
      title: 'Lead Management',
      description: 'Capture, score, and nurture leads',
      href: '/leads',
      icon: Target,
      color: 'bg-blue-500',
      stats: `${stats.activeLeads} active leads`,
    },
    {
      title: 'Client Journey',
      description: 'Track client progress through stages',
      href: '/journey',
      icon: Workflow,
      color: 'bg-green-500',
      stats: `${stats.conversionRate}% conversion rate`,
    },
    {
      title: 'Properties',
      description: 'Manage property listings',
      href: '/properties',
      icon: Building2,
      color: 'bg-purple-500',
      stats: `${stats.propertiesUnderConstruction} under construction`,
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'bg-orange-500',
      stats: `${stats.marketShare}% market share`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Welcome back! Here's what's happening with your real estate business.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Activity className="h-3 w-3 mr-1" />
                    All Systems Active
                  </Badge>
                </div>
              </div>

              {/* Executive KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quarterly Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${(stats.quarterlyRevenue / 1000000).toFixed(1)}M
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(stats.quarterlyRevenue / stats.yearlyTarget * 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round((stats.quarterlyRevenue / stats.yearlyTarget * 4) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${(stats.totalPortfolioValue / 1000000).toFixed(0)}M
                        </p>
                        <p className="text-sm text-blue-600">
                          {stats.propertiesUnderConstruction} under construction
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Market Performance</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.marketShare}%</p>
                        <p className="text-sm text-purple-600">Market share growth</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.clientSatisfaction}/5.0</p>
                        <p className="text-sm text-green-600">{stats.customerRetention}% retention</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeLeads}</p>
                        <p className="text-xs text-green-600">+12% from last month</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                        <p className="text-xs text-green-600">+2.3% from last month</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(stats.avgDealSize / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-blue-600">+8% from last month</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming Handovers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.upcomingHandovers}</p>
                        <p className="text-xs text-orange-600">Next 30 days</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Sparkline */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Revenue Trend</h3>
                    <svg viewBox="0 0 300 80" className="w-full h-24">
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,60 L75,55 L150,45 L225,30 L300,18" fill="none" stroke="#2563eb" strokeWidth="3" />
                      <path d="M0,80 L0,60 L75,55 L150,45 L225,30 L300,18 L300,80 Z" fill="url(#grad1)" />
                    </svg>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Funnel */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Sales Funnel</h3>
                    <div className="space-y-3">
                      {[{label:'Leads',v:100,color:'bg-gray-300'},
                        {label:'Qualified',v:72,color:'bg-blue-400'},
                        {label:'Proposal',v:48,color:'bg-yellow-400'},
                        {label:'Negotiation',v:32,color:'bg-orange-400'},
                        {label:'Closed Won',v:18,color:'bg-green-500'}].map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{s.label}</span>
                            <span className="text-gray-600">{s.v}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div className={`h-2 rounded-full ${s.color}`} style={{width:`${s.v}%`}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Property Types Distribution */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Property Types Distribution</h3>
                    <div className="flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-32 h-32">
                        {/* Donut chart segments */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20"
                                strokeDasharray="125.6 376.8" strokeDashoffset="0" transform="rotate(-90 100 100)" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="20"
                                strokeDasharray="94.2 408.2" strokeDashoffset="-125.6" transform="rotate(-90 100 100)" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="20"
                                strokeDasharray="62.8 439.6" strokeDashoffset="-219.8" transform="rotate(-90 100 100)" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="20"
                                strokeDasharray="94.2 408.2" strokeDashoffset="-282.6" transform="rotate(-90 100 100)" />
                      </svg>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        {label:'Apartments',value:25,color:'bg-blue-500'},
                        {label:'Villas',value:18,color:'bg-green-500'},
                        {label:'Townhouses',value:12,color:'bg-yellow-500'},
                        {label:'Penthouses',value:18,color:'bg-red-500'}
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span>{item.label}</span>
                          </div>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Velocity */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Activity Velocity</h3>
                    <div className="w-full h-16 bg-gray-100 rounded flex items-end gap-1 p-1">
                      {[6,9,5,8,12,10,14,9,7,11,15,13,12,10].map((h,i)=> (
                        <div key={i} className="flex-1 bg-blue-500 rounded" style={{height:`${h * 6}px`}} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Daily interactions last 2 weeks</p>
                  </CardContent>
                </Card>
              </div>


              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.href}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                          <p className="text-sm font-medium text-gray-900">{action.stats}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
    </DashboardLayout>
  );
}
