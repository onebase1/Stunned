'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Bell,
  Brain,
  Workflow,
  Target,
  ArrowRight
} from 'lucide-react';

export default function AutomatedStageProgression() {
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(85);

  const automationRules = [
    {
      id: '1',
      name: 'Lead to Qualified Auto-Progression',
      description: 'Automatically move leads to qualified when they meet criteria',
      fromStage: 'LEAD',
      toStage: 'QUALIFIED',
      isActive: true,
      triggerCount: 23,
      successRate: 87,
      aiConfidence: 92
    },
    {
      id: '2',
      name: 'Viewing to Negotiation Progression',
      description: 'Move clients to negotiation after successful property viewing',
      fromStage: 'VIEWING',
      toStage: 'NEGOTIATION',
      isActive: true,
      triggerCount: 15,
      successRate: 73,
      aiConfidence: 78
    },
    {
      id: '3',
      name: 'Stale Lead Alert',
      description: 'Alert for leads that have been inactive for too long',
      fromStage: 'LEAD',
      toStage: 'LEAD',
      isActive: true,
      triggerCount: 8,
      successRate: 100,
      aiConfidence: 95
    }
  ];

  const pendingProgressions = [
    {
      id: '1',
      clientName: 'John Smith',
      currentStage: 'LEAD',
      suggestedStage: 'QUALIFIED',
      reason: 'Lead score increased to 78, budget confirmed via phone call',
      confidence: 89,
      aiRecommendation: 'Strong candidate for qualification. Recent interaction shows serious buying intent.'
    },
    {
      id: '2',
      clientName: 'Emily Davis',
      currentStage: 'VIEWING',
      suggestedStage: 'NEGOTIATION',
      reason: 'Completed property viewing, expressed strong interest, requested pricing details',
      confidence: 82,
      aiRecommendation: 'Client showed high engagement during viewing. Ready for price negotiation discussion.'
    }
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'LEAD': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'VIEWING': 'bg-purple-100 text-purple-800',
      'NEGOTIATION': 'bg-orange-100 text-orange-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Automated Stage Progression
          </h2>
          <p className="text-gray-600">AI-powered client journey automation and progression management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-enabled"
              checked={isAiEnabled}
              onCheckedChange={setIsAiEnabled}
            />
            <Label htmlFor="ai-enabled">AI Automation</Label>
          </div>
          <Badge variant={isAiEnabled ? "default" : "secondary"}>
            {isAiEnabled ? "Active" : "Disabled"}
          </Badge>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">{automationRules.filter(r => r.isActive).length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold">{pendingProgressions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(automationRules.reduce((sum, rule) => sum + rule.successRate, 0) / automationRules.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold">
                  {Math.round(automationRules.reduce((sum, rule) => sum + rule.aiConfidence, 0) / automationRules.length)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pending Stage Progressions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProgressions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending stage progressions at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProgressions.map((progression) => (
                <Card key={progression.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{progression.clientName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getStageColor(progression.currentStage)}>
                              {progression.currentStage}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <Badge className={getStageColor(progression.suggestedStage)}>
                              {progression.suggestedStage}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{progression.reason}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            <span className={`font-medium ${getConfidenceColor(progression.confidence)}`}>
                              {progression.confidence}% confidence
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>AI Recommendation:</strong> {progression.aiRecommendation}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        {rule.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Disabled"}
                      </Badge>
                      <Switch checked={rule.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Stage Transition</h5>
                      <div className="flex items-center gap-2">
                        <Badge className={getStageColor(rule.fromStage)}>
                          {rule.fromStage}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <Badge className={getStageColor(rule.toStage)}>
                          {rule.toStage}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Performance</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Triggered:</span>
                          <span className="font-medium">{rule.triggerCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">{rule.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(rule.aiConfidence)}`}>
                            {rule.aiConfidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Actions</h5>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Test Rule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
