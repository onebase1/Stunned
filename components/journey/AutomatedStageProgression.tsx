'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  Bot, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Target,
  Brain,
  Workflow,
  Bell,
  Calendar,
  User,
  MessageSquare,
  Mail,
  Phone,
  Award,
  ArrowRight,
  Activity
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  fromStage: string;
  toStage: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  triggerCount: number;
  successRate: number;
  lastTriggered?: string;
  aiConfidence: number;
}

interface AutomationCondition {
  type: 'time_in_stage' | 'lead_score' | 'interaction_count' | 'property_match' | 'budget_confirmed' | 'viewing_completed';
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
  value: string | number;
  description: string;
}

interface AutomationAction {
  type: 'stage_progression' | 'send_notification' | 'schedule_followup' | 'assign_agent' | 'send_email' | 'create_task';
  parameters: Record<string, any>;
  description: string;
}

interface PendingProgression {
  id: string;
  clientId: string;
  clientName: string;
  currentStage: string;
  suggestedStage: string;
  reason: string;
  confidence: number;
  automationRuleId: string;
  createdAt: string;
  aiRecommendation: string;
}

export default function AutomatedStageProgression() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [pendingProgressions, setPendingProgressions] = useState<PendingProgression[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(85);
  const [isLoading, setIsLoading] = useState(true);

  // Mock automation rules
  const mockRules: AutomationRule[] = [
    {
      id: '1',
      name: 'Lead to Qualified Auto-Progression',
      description: 'Automatically move leads to qualified when they meet criteria',
      fromStage: 'LEAD',
      toStage: 'QUALIFIED',
      conditions: [
        {
          type: 'lead_score',
          operator: 'greater_than',
          value: 70,
          description: 'Lead score above 70'
        },
        {
          type: 'budget_confirmed',
          operator: 'equals',
          value: true,
          description: 'Budget range confirmed'
        }
      ],
      actions: [
        {
          type: 'stage_progression',
          parameters: { stage: 'QUALIFIED' },
          description: 'Move to Qualified stage'
        },
        {
          type: 'send_notification',
          parameters: { 
            type: 'agent_notification',
            message: 'Client automatically qualified - review and contact within 24 hours'
          },
          description: 'Notify assigned agent'
        }
      ],
      isActive: true,
      triggerCount: 23,
      successRate: 87,
      lastTriggered: '2024-08-24T10:30:00Z',
      aiConfidence: 92
    },
    {
      id: '2',
      name: 'Viewing to Negotiation Progression',
      description: 'Move clients to negotiation after successful property viewing',
      fromStage: 'VIEWING',
      toStage: 'NEGOTIATION',
      conditions: [
        {
          type: 'viewing_completed',
          operator: 'equals',
          value: true,
          description: 'Property viewing completed'
        },
        {
          type: 'interaction_count',
          operator: 'greater_than',
          value: 2,
          description: 'At least 2 interactions post-viewing'
        }
      ],
      actions: [
        {
          type: 'stage_progression',
          parameters: { stage: 'NEGOTIATION' },
          description: 'Move to Negotiation stage'
        },
        {
          type: 'schedule_followup',
          parameters: { 
            type: 'call',
            days: 1,
            subject: 'Discuss property interest and pricing'
          },
          description: 'Schedule negotiation call'
        }
      ],
      isActive: true,
      triggerCount: 15,
      successRate: 73,
      lastTriggered: '2024-08-23T15:20:00Z',
      aiConfidence: 78
    },
    {
      id: '3',
      name: 'Stale Lead Alert',
      description: 'Alert for leads that have been inactive for too long',
      fromStage: 'LEAD',
      toStage: 'LEAD',
      conditions: [
        {
          type: 'time_in_stage',
          operator: 'greater_than',
          value: 7,
          description: 'More than 7 days in LEAD stage'
        }
      ],
      actions: [
        {
          type: 'send_notification',
          parameters: { 
            type: 'manager_alert',
            message: 'Lead has been inactive for over 7 days - requires attention'
          },
          description: 'Alert manager'
        },
        {
          type: 'create_task',
          parameters: { 
            title: 'Follow up with stale lead',
            priority: 'high'
          },
          description: 'Create high-priority follow-up task'
        }
      ],
      isActive: true,
      triggerCount: 8,
      successRate: 100,
      lastTriggered: '2024-08-22T09:15:00Z',
      aiConfidence: 95
    }
  ];

  // Mock pending progressions
  const mockPendingProgressions: PendingProgression[] = [
    {
      id: '1',
      clientId: 'client-1',
      clientName: 'John Smith',
      currentStage: 'LEAD',
      suggestedStage: 'QUALIFIED',
      reason: 'Lead score increased to 78, budget confirmed via phone call',
      confidence: 89,
      automationRuleId: '1',
      createdAt: '2024-08-24T14:30:00Z',
      aiRecommendation: 'Strong candidate for qualification. Recent interaction shows serious buying intent.'
    },
    {
      id: '2',
      clientId: 'client-2',
      clientName: 'Emily Davis',
      currentStage: 'VIEWING',
      suggestedStage: 'NEGOTIATION',
      reason: 'Completed property viewing, expressed strong interest, requested pricing details',
      confidence: 82,
      automationRuleId: '2',
      createdAt: '2024-08-24T11:15:00Z',
      aiRecommendation: 'Client showed high engagement during viewing. Ready for price negotiation discussion.'
    },
    {
      id: '3',
      clientId: 'client-3',
      clientName: 'Sarah Williams',
      currentStage: 'LEAD',
      suggestedStage: 'LEAD',
      reason: 'No contact for 8 days, requires immediate follow-up',
      confidence: 95,
      automationRuleId: '3',
      createdAt: '2024-08-24T08:00:00Z',
      aiRecommendation: 'High-priority follow-up needed. Lead may be lost without immediate action.'
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setAutomationRules(mockRules);
      setPendingProgressions(mockPendingProgressions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    const rule = automationRules.find(r => r.id === ruleId);
    toast({
      title: rule?.isActive ? "Rule Disabled" : "Rule Enabled",
      description: `Automation rule "${rule?.name}" has been ${rule?.isActive ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleApproveProgression = (progressionId: string) => {
    const progression = pendingProgressions.find(p => p.id === progressionId);
    if (!progression) return;

    setPendingProgressions(prev => prev.filter(p => p.id !== progressionId));
    
    toast({
      title: "Progression Approved",
      description: `${progression.clientName} has been moved to ${progression.suggestedStage} stage.`,
    });
  };

  const handleRejectProgression = (progressionId: string) => {
    const progression = pendingProgressions.find(p => p.id === progressionId);
    if (!progression) return;

    setPendingProgressions(prev => prev.filter(p => p.id !== progressionId));
    
    toast({
      title: "Progression Rejected",
      description: `Stage progression for ${progression.clientName} has been rejected.`,
      variant: "destructive",
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'LEAD': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'PROPERTY_MATCHED': 'bg-blue-100 text-blue-800',
      'VIEWING': 'bg-purple-100 text-purple-800',
      'NEGOTIATION': 'bg-orange-100 text-orange-800',
      'CONTRACT': 'bg-indigo-100 text-indigo-800',
      'PAYMENT_SETUP': 'bg-pink-100 text-pink-800',
      'CONSTRUCTION': 'bg-cyan-100 text-cyan-800',
      'HANDOVER': 'bg-emerald-100 text-emerald-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading automation system...</p>
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

      {/* Main Content */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
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
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(progression.createdAt).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>AI Recommendation:</strong> {progression.aiRecommendation}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveProgression(progression.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectProgression(progression.id)}
                            >
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
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
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
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
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
                      <h5 className="font-medium mb-2">Conditions</h5>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            {condition.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {rule.lastTriggered && (
                    <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                      Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI Automation</Label>
                  <p className="text-sm text-gray-600">Allow AI to automatically suggest and execute stage progressions</p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={isAiEnabled}
                  onCheckedChange={setIsAiEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Auto-Approve Confidence Threshold</Label>
                <p className="text-sm text-gray-600">
                  Automatically approve progressions with confidence above this threshold
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={autoApproveThreshold} className="flex-1" />
                  <span className="text-sm font-medium w-12">{autoApproveThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={autoApproveThreshold}
                  onChange={(e) => setAutoApproveThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Benefits of AI Automation</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 40% faster client progression</li>
                    <li>• 25% improvement in conversion rates</li>
                    <li>• Reduced manual oversight required</li>
                    <li>• Consistent application of business rules</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">AI Integration Points</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Lead scoring analysis</li>
                    <li>• Interaction pattern recognition</li>
                    <li>• Behavioral trigger detection</li>
                    <li>• Predictive progression modeling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
