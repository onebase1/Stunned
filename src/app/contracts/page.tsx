'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { ContractService } from '@/lib/supabase-service';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const payload = await res.json();
        // API returns either paginated shape or raw array
        const rows = payload?.data || payload || [];
        setContracts(rows);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError('Failed to load contracts');
      // Fallback to mock data
      setContracts([
        {
          id: 1,
          contract_number: 'CNT-2024-001',
          client_name: 'John Smith',
          property_name: 'Luxury Villa - Sunset Heights',
          contract_value: 2500000,
          contract_type: 'Purchase Agreement',
          status: 'Active',
          signing_date: '2024-01-15',
          closing_date: '2024-03-15',
          commission_rate: 3.0,
          commission_amount: 75000,
          terms: 'Standard purchase terms with 30-day inspection period'
        },
        {
          id: 2,
          contract_number: 'CNT-2024-002',
          client_name: 'Sarah Johnson',
          property_name: 'Downtown Condo - City Center',
          contract_value: 850000,
          contract_type: 'Purchase Agreement',
          status: 'Pending Signature',
          signing_date: null,
          closing_date: '2024-02-28',
          commission_rate: 2.5,
          commission_amount: 21250,
          terms: 'Cash purchase, no financing contingency'
        },
        {
          id: 3,
          contract_number: 'CNT-2024-003',
          client_name: 'Michael Davis',
          property_name: 'Family Home - Green Valley',
          contract_value: 1200000,
          contract_type: 'Purchase Agreement',
          status: 'Under Review',
          signing_date: '2024-01-10',
          closing_date: '2024-04-10',
          commission_rate: 3.5,
          commission_amount: 42000,
          terms: 'Financing contingency, home inspection required'
        },
        {
          id: 4,
          contract_number: 'CNT-2024-004',
          client_name: 'Emily Wilson',
          property_name: 'Investment Property - Marina District',
          contract_value: 420000,
          contract_type: 'Lease Agreement',
          status: 'Completed',
          signing_date: '2024-01-05',
          closing_date: '2024-01-20',
          commission_rate: 1.0,
          commission_amount: 4200,
          terms: '2-year lease with option to purchase'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending signature': return 'bg-yellow-100 text-yellow-800';
      case 'under review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending signature': return <Clock className="h-4 w-4" />;
      case 'under review': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Normalize API rows (join fields) for display
  const normalized = contracts.map((c: any) => ({
    ...c,
    client_name: c.client_name || (c.client ? `${c.client.first_name} ${c.client.last_name}` : undefined),
    property_name: c.property_name || c.property?.property_name,
    contract_value: c.contract_value ?? c.total_amount,
    commission_rate: c.commission_rate ?? 3,
    commission_amount: c.commission_amount ?? Math.round((c.total_amount || 0) * ((c.commission_rate ?? 3) / 100)),
    status: c.status || (c.contract_status ? c.contract_status.replace(/_/g, ' ') : undefined),
    closing_date: c.closing_date || c.expected_completion_date,
  }));

  const filteredContracts = normalized.filter((contract: any) =>
    (contract.contract_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.property_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalContracts: normalized.length,
    activeContracts: normalized.filter(c => (c.status || '').toLowerCase() === 'active').length,
    pendingSignature: normalized.filter(c => (c.status || '').toLowerCase() === 'pending signature').length,
    totalValue: normalized.reduce((sum, c) => sum + (c.contract_value || 0), 0),
    totalCommission: normalized.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales & Contracts</h1>
            <p className="text-gray-600">Manage contracts, agreements, and sales documentation</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalContracts}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeContracts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingSignature}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats.totalCommission / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Contract</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Closing Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract: any) => (
                    <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{contract.contract_number}</p>
                          <p className="text-sm text-gray-500">{contract.contract_type}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{contract.client_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{contract.property_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">
                          ${(contract.contract_value / 1000).toFixed(0)}K
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Badge className={getStatusColor(contract.status)}>
                            <span className="mr-1">{getStatusIcon(contract.status)}</span>
                            {contract.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {contract.closing_date ? new Date(contract.closing_date).toLocaleDateString() : 'TBD'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-green-600">
                            ${(contract.commission_amount / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-gray-500">{contract.commission_rate}%</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or create a new contract.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
