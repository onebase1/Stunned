'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Star, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Home,
  Zap
} from 'lucide-react';

interface LeadScoreFactors {
  budgetAlignment: number;
  locationMatch: number;
  responseTime: number;
  engagementLevel: number;
  leadSource: number;
  completeness: number;
  urgency: number;
  qualification: number;
}

interface LeadScoringProps {
  leadId?: string;
  leadData?: any;
  onScoreUpdate?: (score: number, factors: LeadScoreFactors) => void;
}

export default function LeadScoringSystem({ leadId, leadData, onScoreUpdate }: LeadScoringProps) {
  const [scoreFactors, setScoreFactors] = useState<LeadScoreFactors>({
    budgetAlignment: 0,
    locationMatch: 0,
    responseTime: 0,
    engagementLevel: 0,
    leadSource: 0,
    completeness: 0,
    urgency: 0,
    qualification: 0,
  });

  const [totalScore, setTotalScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<Array<{
    date: string;
    score: number;
    change: number;
    reason: string;
  }>>([]);

  // Scoring weights (total should equal 100)
  const weights = {
    budgetAlignment: 20,
    locationMatch: 10,
    responseTime: 15,
    engagementLevel: 15,
    leadSource: 10,
    completeness: 10,
    urgency: 10,
    qualification: 10,
  };

  useEffect(() => {
    if (leadData) {
      calculateLeadScore(leadData);
    }
  }, [leadData]);

  const calculateLeadScore = (data: any) => {
    const factors: LeadScoreFactors = {
      budgetAlignment: calculateBudgetAlignment(data),
      locationMatch: calculateLocationMatch(data),
      responseTime: calculateResponseTime(data),
      engagementLevel: calculateEngagementLevel(data),
      leadSource: calculateLeadSourceScore(data),
      completeness: calculateCompleteness(data),
      urgency: calculateUrgency(data),
      qualification: calculateQualification(data),
    };

    setScoreFactors(factors);

    // Calculate weighted total score
    const total = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof typeof weights] / 100);
    }, 0);

    setTotalScore(Math.round(total));

    if (onScoreUpdate) {
      onScoreUpdate(Math.round(total), factors);
    }
  };

  const calculateBudgetAlignment = (data: any): number => {
    if (!data.budgetMin || !data.budgetMax) return 30; // Partial info

    const avgBudget = (data.budgetMin + data.budgetMax) / 2;
    
    // Score based on budget range (higher budgets = higher scores)
    if (avgBudget >= 1000000) return 100;
    if (avgBudget >= 750000) return 90;
    if (avgBudget >= 500000) return 80;
    if (avgBudget >= 350000) return 70;
    if (avgBudget >= 250000) return 60;
    return 40;
  };

  const calculateLocationMatch = (data: any): number => {
    if (!data.preferredLocation) return 20;

    // Score based on location desirability
    const location = data.preferredLocation.toLowerCase();
    if (location.includes('waterfront') || location.includes('downtown')) return 100;
    if (location.includes('midtown') || location.includes('uptown')) return 80;
    if (location.includes('suburbs')) return 70;
    return 60;
  };

  const calculateResponseTime = (data: any): number => {
    if (!data.lastContactDate) return 50;

    const lastContact = new Date(data.lastContactDate);
    const now = new Date();
    const hoursSinceContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60);

    // Score based on recency of contact
    if (hoursSinceContact <= 1) return 100;
    if (hoursSinceContact <= 6) return 90;
    if (hoursSinceContact <= 24) return 80;
    if (hoursSinceContact <= 72) return 60;
    if (hoursSinceContact <= 168) return 40; // 1 week
    return 20;
  };

  const calculateEngagementLevel = (data: any): number => {
    let score = 40; // Base score

    // Add points for engagement indicators
    if (data.phone) score += 15;
    if (data.whatsappNumber) score += 15;
    if (data.specialRequirements) score += 10;
    if (data.nextFollowUpDate) score += 10;
    if (data.tags && data.tags.length > 0) score += 10;

    return Math.min(score, 100);
  };

  const calculateLeadSourceScore = (data: any): number => {
    const sourceScores: Record<string, number> = {
      referral: 100,
      website: 80,
      social_media: 70,
      whatsapp: 75,
      phone: 85,
      email: 65,
      walk_in: 90,
      advertisement: 60,
      event: 85,
    };

    return sourceScores[data.leadSource] || 50;
  };

  const calculateCompleteness = (data: any): number => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'budgetMin', 'budgetMax', 'preferredLocation', 'preferredBedrooms'
    ];
    
    const completedFields = requiredFields.filter(field => data[field]).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const calculateUrgency = (data: any): number => {
    let score = 50; // Base score

    // Check urgency indicators
    if (data.specialRequirements?.toLowerCase().includes('urgent')) score += 30;
    if (data.specialRequirements?.toLowerCase().includes('asap')) score += 30;
    if (data.tags?.includes('urgent')) score += 25;
    if (data.tags?.includes('hot-lead')) score += 25;

    // Timeline urgency
    if (data.nextFollowUpDate) {
      const followUp = new Date(data.nextFollowUpDate);
      const now = new Date();
      const daysUntilFollowUp = (followUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilFollowUp <= 1) score += 20;
      else if (daysUntilFollowUp <= 3) score += 10;
    }

    return Math.min(score, 100);
  };

  const calculateQualification = (data: any): number => {
    let score = 30; // Base score

    // Qualification indicators
    if (data.currentStage === 'QUALIFIED') score += 40;
    if (data.currentStage === 'PROPERTY_MATCHED') score += 50;
    if (data.currentStage === 'VIEWING') score += 60;
    if (data.priorityLevel === 'high') score += 20;
    if (data.priorityLevel === 'medium') score += 10;

    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot Lead';
    if (score >= 60) return 'Warm Lead';
    if (score >= 40) return 'Cold Lead';
    return 'Poor Lead';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const factorDetails = [
    {
      key: 'budgetAlignment',
      label: 'Budget Alignment',
      icon: DollarSign,
      description: 'How well the lead\'s budget aligns with our property portfolio',
      weight: weights.budgetAlignment,
    },
    {
      key: 'locationMatch',
      label: 'Location Match',
      icon: MapPin,
      description: 'Desirability and availability of preferred location',
      weight: weights.locationMatch,
    },
    {
      key: 'responseTime',
      label: 'Response Time',
      icon: Clock,
      description: 'How recently the lead was contacted or engaged',
      weight: weights.responseTime,
    },
    {
      key: 'engagementLevel',
      label: 'Engagement Level',
      icon: MessageSquare,
      description: 'Level of interaction and information provided',
      weight: weights.engagementLevel,
    },
    {
      key: 'leadSource',
      label: 'Lead Source',
      icon: Target,
      description: 'Quality and reliability of the lead source',
      weight: weights.leadSource,
    },
    {
      key: 'completeness',
      label: 'Profile Completeness',
      icon: CheckCircle,
      description: 'How complete the lead\'s profile information is',
      weight: weights.completeness,
    },
    {
      key: 'urgency',
      label: 'Urgency Level',
      icon: Zap,
      description: 'Indicators of timeline urgency and buying intent',
      weight: weights.urgency,
    },
    {
      key: 'qualification',
      label: 'Qualification Status',
      icon: Award,
      description: 'Current stage and qualification level of the lead',
      weight: weights.qualification,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Lead Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                  {totalScore}
                </span>
                <Badge className={getScoreBadgeColor(totalScore)}>
                  {getScoreLabel(totalScore)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">Overall Lead Score</p>
            </div>
            <div className="text-right">
              <Progress value={totalScore} className="w-32 mb-2" />
              <p className="text-sm text-gray-600">{totalScore}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium">Conversion Probability</p>
              <p className="text-lg font-bold text-green-600">{Math.round(totalScore * 0.8)}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium">Expected Timeline</p>
              <p className="text-lg font-bold text-blue-600">
                {totalScore >= 80 ? '2-4 weeks' : totalScore >= 60 ? '1-2 months' : '2-6 months'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-medium">Priority Level</p>
              <p className="text-lg font-bold text-purple-600">
                {totalScore >= 80 ? 'High' : totalScore >= 60 ? 'Medium' : 'Low'}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <p className="text-sm font-medium">Recommended Action</p>
              <p className="text-lg font-bold text-orange-600">
                {totalScore >= 80 ? 'Contact Now' : totalScore >= 60 ? 'Follow Up' : 'Nurture'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="factors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="factors">Score Factors</TabsTrigger>
          <TabsTrigger value="history">Score History</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-4">
          <div className="grid gap-4">
            {factorDetails.map((factor) => {
              const score = scoreFactors[factor.key as keyof LeadScoreFactors];
              const Icon = factor.icon;
              
              return (
                <Card key={factor.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium">{factor.label}</h4>
                          <p className="text-sm text-gray-600">{factor.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                          {score}
                        </span>
                        <p className="text-xs text-gray-500">Weight: {factor.weight}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score} className="flex-1" />
                      <span className="text-sm text-gray-600 w-12">{score}/100</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score History</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Score History</h3>
                  <p className="text-gray-600">
                    Score changes will appear here as the lead progresses through the pipeline.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scoreHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{entry.reason}</p>
                        <p className="text-sm text-gray-600">{entry.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </span>
                        <div className="flex items-center gap-1">
                          {entry.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                          )}
                          <span className={`text-sm ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalScore >= 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">High Priority Lead</p>
                <p className="text-sm text-green-700">
                  This lead shows strong buying signals. Contact immediately and schedule a property viewing.
                </p>
              </div>
            )}
            
            {scoreFactors.completeness < 70 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800">Incomplete Profile</p>
                <p className="text-sm text-yellow-700">
                  Gather more information about budget, preferences, and timeline to improve lead quality.
                </p>
              </div>
            )}
            
            {scoreFactors.responseTime < 50 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800">Follow-up Required</p>
                <p className="text-sm text-red-700">
                  This lead hasn't been contacted recently. Schedule immediate follow-up to maintain engagement.
                </p>
              </div>
            )}
            
            {scoreFactors.engagementLevel < 60 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">Increase Engagement</p>
                <p className="text-sm text-blue-700">
                  Send personalized content, property recommendations, or market updates to boost engagement.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
