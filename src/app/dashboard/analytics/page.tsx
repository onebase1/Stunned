'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Target,
  Calendar,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';

export default function AnalyticsPage() {
  // Temporary disable: route stub while we move charts to main Dashboard
  return (
    <DashboardLayout>
      <div className="p-6 space-y-2">
        <h1 className="text-2xl font-bold">Analytics temporarily disabled</h1>
        <p className="text-gray-600">We moved visual analytics to the main Dashboard while we refactor this page.</p>
      </div>
    </DashboardLayout>
  );
}
