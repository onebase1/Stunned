'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Target, 
  Star,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Car,
  Heart,
  Send,
  Eye,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Filter,
  Search
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
  parking: number;
  amenities: string[];
  agent: string;
  views: number;
  inquiries: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: { min: number; max: number };
  preferredType: string[];
  preferredLocation: string[];
  bedrooms: number;
  amenities: string[];
  urgency: 'low' | 'medium' | 'high';
  leadScore: number;
  agent: string;
  lastContact: string;
}

interface PropertyMatch {
  client: Client;
  property: Property;
  matchScore: number;
  matchReasons: string[];
  aiRecommendation: string;
}

interface PropertyMatchingProps {
  properties: Property[];
}

export default function PropertyMatching({ properties }: PropertyMatchingProps) {
  const [selectedTab, setSelectedTab] = useState('matches');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Mock client data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      budget: { min: 800000, max: 1200000 },
      preferredType: ['apartment', 'townhouse'],
      preferredLocation: ['Downtown Dubai', 'Marina Bay'],
      bedrooms: 2,
      amenities: ['Pool', 'Gym', 'Parking'],
      urgency: 'high',
      leadScore: 85,
      agent: 'Sarah Johnson',
      lastContact: '2024-08-24T10:30:00Z'
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 234-5678',
      budget: { min: 1500000, max: 2500000 },
      preferredType: ['villa', 'penthouse'],
      preferredLocation: ['Arabian Ranches', 'Palm Jumeirah'],
      bedrooms: 4,
      amenities: ['Private Pool', 'Garden', 'Sea View'],
      urgency: 'medium',
      leadScore: 92,
      agent: 'Michael Brown',
      lastContact: '2024-08-24T09:15:00Z'
    },
    {
      id: '3',
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1 (555) 345-6789',
      budget: { min: 2000000, max: 3500000 },
      preferredType: ['villa', 'penthouse'],
      preferredLocation: ['Palm Jumeirah', 'Emirates Hills'],
      bedrooms: 5,
      amenities: ['Private Beach', 'Elevator', 'Cinema'],
      urgency: 'high',
      leadScore: 95,
      agent: 'Lisa Chen',
      lastContact: '2024-08-23T16:45:00Z'
    }
  ];

  // Generate property matches for clients
  const generateMatches = (): PropertyMatch[] => {
    const matches: PropertyMatch[] = [];
    
    mockClients.forEach(client => {
      properties.forEach(property => {
        if (property.status !== 'available') return;
        
        let matchScore = 0;
        const matchReasons: string[] = [];
        
        // Budget match (30% weight)
        if (property.price >= client.budget.min && property.price <= client.budget.max) {
          matchScore += 30;
          matchReasons.push('Price within budget range');
        } else if (property.price <= client.budget.max * 1.1) {
          matchScore += 20;
          matchReasons.push('Price slightly above budget but negotiable');
        }
        
        // Property type match (25% weight)
        if (client.preferredType.includes(property.type)) {
          matchScore += 25;
          matchReasons.push(`Matches preferred type: ${property.type}`);
        }
        
        // Location match (20% weight)
        const locationMatch = client.preferredLocation.some(loc => 
          property.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (locationMatch) {
          matchScore += 20;
          matchReasons.push('Located in preferred area');
        }
        
        // Bedroom match (15% weight)
        if (property.bedrooms >= client.bedrooms) {
          matchScore += 15;
          matchReasons.push(`Has ${property.bedrooms} bedrooms (required: ${client.bedrooms})`);
        }
        
        // Amenities match (10% weight)
        const amenityMatches = client.amenities.filter(amenity =>
          property.amenities.some(propAmenity => 
            propAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (amenityMatches.length > 0) {
          matchScore += Math.min(10, amenityMatches.length * 3);
          matchReasons.push(`Includes desired amenities: ${amenityMatches.join(', ')}`);
        }
        
        // Only include matches with score > 40
        if (matchScore > 40) {
          matches.push({
            client,
            property,
            matchScore,
            matchReasons,
            aiRecommendation: generateAIRecommendation(matchScore, client, property)
          });
        }
      });
    });
    
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const generateAIRecommendation = (score: number, client: Client, property: Property): string => {
    if (score >= 80) {
      return `Excellent match! This property aligns perfectly with ${client.name}'s requirements. Recommend immediate viewing.`;
    } else if (score >= 65) {
      return `Strong match with good potential. Consider highlighting the property's unique features that align with client preferences.`;
    } else if (score >= 50) {
      return `Moderate match. May require some compromise on client's part, but worth presenting as an option.`;
    } else {
      return `Lower match score. Consider only if other options are limited or if property has exceptional value proposition.`;
    }
  };

  const matches = generateMatches();
  const topMatches = matches.slice(0, 10);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            AI-Powered Property Matching
          </h2>
          <p className="text-gray-600">Intelligent client-property matching based on preferences and behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Refresh Matches
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold">{matches.length}</p>
                <p className="text-xs text-blue-600">{topMatches.length} high-quality</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold">
                  {matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) : 0}
                </p>
                <p className="text-xs text-green-600">Quality matching</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{mockClients.length}</p>
                <p className="text-xs text-purple-600">Seeking properties</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">
                  {mockClients.filter(c => c.urgency === 'high').length}
                </p>
                <p className="text-xs text-red-600">Urgent clients</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Top Property Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMatches.map((match, index) => (
              <Card key={`${match.client.id}-${match.property.id}`} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{match.client.name}</h4>
                          <p className="text-sm text-gray-600">{match.property.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
                            {match.matchScore}%
                          </div>
                          <Badge className={getUrgencyColor(match.client.urgency)}>
                            {match.client.urgency} priority
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-gray-900">Client Requirements</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatPrice(match.client.budget.min)} - {formatPrice(match.client.budget.max)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bed className="h-3 w-3" />
                              <span>{match.client.bedrooms}+ bedrooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{match.client.preferredLocation.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-gray-900">Property Details</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatPrice(match.property.price)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bed className="h-3 w-3" />
                              <span>{match.property.bedrooms} bed, {match.property.bathrooms} bath</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{match.property.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-900">Match Reasons</h5>
                        <div className="flex flex-wrap gap-1">
                          {match.matchReasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <h6 className="text-sm font-medium text-blue-900">AI Recommendation</h6>
                            <p className="text-sm text-blue-800">{match.aiRecommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      <div className="text-center mb-2">
                        <div className="text-sm text-gray-600 mb-1">Match Score</div>
                        <Progress value={match.matchScore} className="h-2" />
                      </div>
                      <Button size="sm" className="w-full">
                        <Send className="h-4 w-4 mr-1" />
                        Send to Client
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Viewing
                      </Button>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-4 w-4" />
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

      {topMatches.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600">Try adjusting client preferences or add more properties to the portfolio.</p>
        </div>
      )}
    </div>
  );
}
