'use client';

import DashboardLayout from '@/components/dashboard-layout';

export default function ConstructionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Construction Overview</h1>
        <p className="text-gray-600">This section will show construction progress once connected to data sources.</p>
      </div>
    </DashboardLayout>
  );
}
