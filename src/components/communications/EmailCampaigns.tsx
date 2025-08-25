'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
  agent: string;
}

interface EmailCampaignsProps {
  campaigns: Campaign[];
  onCampaignUpdate: (id: string, updates: Partial<Campaign>) => void;
}

export default function EmailCampaigns({ campaigns, onCampaignUpdate }: EmailCampaignsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Campaigns</h3>
        <p className="text-gray-600">Campaign management functionality coming soon.</p>
      </div>
    </div>
  );
}
