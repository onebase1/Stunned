'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Download,
  Send,
  Signature,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Upload
} from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  clientName: string;
  clientEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  contractValue: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed' | 'cancelled';
  createdDate: string;
  signedDate?: string;
  completionDate?: string;
  agent: string;
  paymentSchedule: PaymentSchedule[];
  documents: Document[];
  milestones: Milestone[];
}

interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

interface ContractManagementProps {
  contracts: Contract[];
  onContractUpdate: (id: string, updates: Partial<Contract>) => void;
}

export default function ContractManagement({ contracts, onContractUpdate }: ContractManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_signature': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'pending_signature': return <Signature className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => 
    new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contracts by number, client, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_signature">Pending Signature</option>
            <option value="signed">Signed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {sortedContracts.length} of {contracts.length} contracts
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {sortedContracts.map((contract) => (
          <Card 
            key={contract.id} 
            className={`hover:shadow-md transition-shadow ${
              contract.status === 'pending_signature' ? 'border-yellow-200 bg-yellow-50' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(contract.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{contract.contractNumber}</h3>
                      <p className="text-gray-600">{contract.clientName} • {contract.agent}</p>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {formatStatus(contract.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">Property</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{contract.propertyTitle}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{contract.propertyLocation}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">Contract Value</p>
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(contract.contractValue)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {contract.paymentSchedule.filter(p => p.status === 'paid').length} of {contract.paymentSchedule.length} payments
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">Timeline</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(contract.createdDate).toLocaleDateString()}</span>
                      </div>
                      {contract.signedDate && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Signed: {new Date(contract.signedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">Client Contact</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{contract.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Agent: {contract.agent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-900">Documents:</span>
                    <div className="flex gap-2">
                      {contract.documents.map((doc) => (
                        <Badge key={doc.id} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  {contract.status === 'signed' && contract.milestones.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">Progress</p>
                      <div className="flex gap-2">
                        {contract.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'in_progress' ? 'bg-blue-500' :
                              milestone.status === 'delayed' ? 'bg-red-500' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-xs text-gray-600">{milestone.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  <Button size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  {contract.status === 'draft' && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </Button>
                  )}
                  
                  {contract.status === 'pending_signature' && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  )}
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {contract.status === 'pending_signature' && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-center">
                      <Clock className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                      <p className="text-xs text-yellow-800">Awaiting client signature</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new contract.</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create New Contract
          </Button>
        </div>
      )}
    </div>
  );
}
