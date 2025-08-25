'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Award,
  Brain,
  Zap,
  Settings,
  Users,
  DollarSign,
  Clock,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function LeadScoringSystem() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const scoringFactors = [
    {
      id: 'budget',
      name: 'Budget Range',
      description: 'Client\'s stated budget vs property prices',
      weight: 25,
      maxScore: 25,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'engagement',
      name: 'Engagement Level',
      description: 'Frequency and quality of interactions',
      weight: 20,
      maxScore: 20,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      id: 'timeline',
      name: 'Purchase Timeline',
      description: 'Urgency of purchase decision',
      weight: 15,
      maxScore: 15,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      id: 'location',
      name: 'Location Match',
      description: 'Preference alignment with available properties',
      weight: 15,
      maxScore: 15,
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: 'qualification',
      name: 'Financial Qualification',
      description: 'Pre-approval status and financial readiness',
      weight: 15,
      maxScore: 15,
      icon: Award,
      color: 'text-indigo-600'
    },
    {
      id: 'behavior',
      name: 'Behavioral Signals',
      description: 'Website activity and response patterns',
      weight: 10,
      maxScore: 10,
      icon: Brain,
      color: 'text-pink-600'
    }
  ];

  const topLeads = [
    {
      id: '1',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      totalScore: 92,
      scores: {
        budget: 23,
        engagement: 18,
        timeline: 14,
        location: 15,
        qualification: 14,
        behavior: 8
      },
      trend: 'up',
      trendValue: 8,
      priority: 'high',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Robert Brown',
      email: 'robert.brown@email.com',
      totalScore: 88,
      scores: {
        budget: 25,
        engagement: 16,
        timeline: 12,
        location: 13,
        qualification: 15,
        behavior: 7
      },
      trend: 'up',
      trendValue: 5,
      priority: 'high',
      lastActivity: '4 hours ago'
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john.smith@email.com',
      totalScore: 85,
      scores: {
        budget: 22,
        engagement: 17,
        timeline: 13,
        location: 14,
        qualification: 12,
        behavior: 7
      },
      trend: 'stable',
      trendValue: 0,
      priority: 'high',
      lastActivity: '1 day ago'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      totalScore: 78,
      scores: {
        budget: 20,
        engagement: 15,
        timeline: 11,
        location: 12,
        qualification: 13,
        behavior: 7
      },
      trend: 'down',
      trendValue: -3,
      priority: 'medium',
      lastActivity: '6 hours ago'
    },
    {
      id: '5',
      name: 'Michael Johnson',
      email: 'michael.johnson@email.com',
      totalScore: 67,
      scores: {
        budget: 18,
        engagement: 12,
        timeline: 10,
        location: 11,
        qualification: 10,
        behavior: 6
      },
      trend: 'up',
      trendValue: 4,
      priority: 'medium',
      lastActivity: '3 hours ago'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6" />
            Lead Scoring System
          </h2>
          <p className="text-gray-600">AI-powered lead qualification and prioritization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Scoring
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Recalculate Scores
          </Button>
        </div>
      </div>

      {/* Scoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High-Score Leads</p>
                <p className="text-2xl font-bold">{topLeads.filter(l => l.totalScore >= 80).length}</p>
                <p className="text-xs text-green-600">Ready for immediate contact</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(topLeads.reduce((sum, lead) => sum + lead.totalScore, 0) / topLeads.length)}
                </p>
                <p className="text-xs text-blue-600">+5 points this week</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Improvements</p>
                <p className="text-2xl font-bold">{topLeads.filter(l => l.trend === 'up').length}</p>
                <p className="text-xs text-green-600">Leads trending upward</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Scoring Factors & Weights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoringFactors.map((factor) => {
              const Icon = factor.icon;
              return (
                <Card key={factor.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${factor.color}`} />
                      <div>
                        <h4 className="font-semibold">{factor.name}</h4>
                        <p className="text-xs text-gray-500">Weight: {factor.weight}%</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Max Score:</span>
                      <Badge variant="outline">{factor.maxScore} points</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Scored Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Scored Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLeads.map((lead, index) => (
              <Card 
                key={lead.id} 
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  selectedLead === lead.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{lead.name}</h4>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`text-3xl font-bold ${getScoreColor(lead.totalScore)}`}>
                          {lead.totalScore}
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            {getTrendIcon(lead.trend, lead.trendValue)}
                            {lead.trendValue !== 0 && (
                              <span className={`text-xs font-medium ${
                                lead.trend === 'up' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {lead.trendValue > 0 ? '+' : ''}{lead.trendValue}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">Last Activity</p>
                        <p className="text-xs text-gray-500">{lead.lastActivity}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedLead === lead.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-3">Score Breakdown</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scoringFactors.map((factor) => {
                          const score = lead.scores[factor.id as keyof typeof lead.scores];
                          const percentage = (score / factor.maxScore) * 100;
                          return (
                            <div key={factor.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{factor.name}</span>
                                <span className="text-sm font-bold">{score}/{factor.maxScore}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
