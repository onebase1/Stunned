'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
  Bell,
  Download,
  Send,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Plus
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
}

interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

interface PaymentProcessingProps {
  contracts: Contract[];
}

interface PaymentSummary {
  totalExpected: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  paymentsThisMonth: number;
  upcomingPayments: number;
}

export default function PaymentProcessing({ contracts }: PaymentProcessingProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');

  // Flatten all payments from all contracts
  const allPayments = contracts.flatMap(contract => 
    contract.paymentSchedule.map(payment => ({
      ...payment,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      clientName: contract.clientName,
      propertyTitle: contract.propertyTitle,
      agent: contract.agent
    }))
  );

  // Calculate payment summary
  const calculatePaymentSummary = (): PaymentSummary => {
    const totalExpected = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalReceived = allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = allPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const paymentsThisMonth = allPayments.filter(p => {
      const paymentDate = p.paidDate ? new Date(p.paidDate) : null;
      return paymentDate && 
             paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    }).reduce((sum, p) => sum + p.amount, 0);

    const upcomingPayments = allPayments.filter(p => {
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      return p.status === 'pending' && dueDate >= today && dueDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalExpected,
      totalReceived,
      totalPending,
      totalOverdue,
      paymentsThisMonth,
      upcomingPayments
    };
  };

  const paymentSummary = calculatePaymentSummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPayments = allPayments.filter(payment => {
    if (statusFilter === 'all') return true;
    return payment.status === statusFilter;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // Sort by due date, with overdue first
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const overduePayments = allPayments.filter(p => p.status === 'overdue');
  const upcomingPayments = allPayments.filter(p => {
    const daysUntil = getDaysUntilDue(p.dueDate);
    return p.status === 'pending' && daysUntil <= 7 && daysUntil >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment Processing & Tracking
          </h2>
          <p className="text-gray-600">Monitor payment schedules, track collections, and manage cash flow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Payments
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expected</p>
                <p className="text-2xl font-bold">{formatPrice(paymentSummary.totalExpected)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(paymentSummary.totalReceived)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-600 h-1 rounded-full" 
                    style={{ width: `${(paymentSummary.totalReceived / paymentSummary.totalExpected) * 100}%` }}
                  ></div>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatPrice(paymentSummary.totalPending)}</p>
                <p className="text-xs text-gray-600">{paymentSummary.upcomingPayments} due soon</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatPrice(paymentSummary.totalOverdue)}</p>
                <p className="text-xs text-red-600">{overduePayments.length} payments</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Collection Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Collection Rate</span>
              <span className="text-sm font-medium">
                {Math.round((paymentSummary.totalReceived / paymentSummary.totalExpected) * 100)}%
              </span>
            </div>
            <Progress 
              value={(paymentSummary.totalReceived / paymentSummary.totalExpected) * 100} 
              className="h-3" 
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{formatPrice(paymentSummary.totalReceived)}</div>
                <div className="text-gray-600">Collected</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{formatPrice(paymentSummary.totalPending)}</div>
                <div className="text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">{formatPrice(paymentSummary.totalOverdue)}</div>
                <div className="text-gray-600">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {(overduePayments.length > 0 || upcomingPayments.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {overduePayments.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Payments ({overduePayments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overduePayments.slice(0, 3).map((payment) => (
                    <div key={`${payment.contractId}-${payment.id}`} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <h4 className="font-medium text-sm">{payment.clientName}</h4>
                        <p className="text-xs text-gray-600">{payment.description}</p>
                        <p className="text-xs text-red-600">
                          {Math.abs(getDaysUntilDue(payment.dueDate))} days overdue
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{formatPrice(payment.amount)}</div>
                        <Button size="sm" className="mt-1">
                          <Bell className="h-3 w-3 mr-1" />
                          Follow Up
                        </Button>
                      </div>
                    </div>
                  ))}
                  {overduePayments.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All {overduePayments.length} Overdue Payments
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingPayments.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  Upcoming Payments ({upcomingPayments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPayments.slice(0, 3).map((payment) => (
                    <div key={`${payment.contractId}-${payment.id}`} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <h4 className="font-medium text-sm">{payment.clientName}</h4>
                        <p className="text-xs text-gray-600">{payment.description}</p>
                        <p className="text-xs text-yellow-600">
                          Due in {getDaysUntilDue(payment.dueDate)} days
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-600">{formatPrice(payment.amount)}</div>
                        <Button size="sm" variant="outline" className="mt-1">
                          <Send className="h-3 w-3 mr-1" />
                          Remind
                        </Button>
                      </div>
                    </div>
                  ))}
                  {upcomingPayments.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All {upcomingPayments.length} Upcoming Payments
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPayments.slice(0, 10).map((payment) => (
              <div 
                key={`${payment.contractId}-${payment.id}`} 
                className={`p-4 border rounded-lg ${
                  payment.status === 'overdue' ? 'border-red-200 bg-red-50' : 
                  payment.status === 'paid' ? 'border-green-200 bg-green-50' : 
                  'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <h4 className="font-medium">{payment.clientName}</h4>
                        <p className="text-sm text-gray-600">{payment.contractNumber} • {payment.propertyTitle}</p>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Payment Details</p>
                        <p className="text-gray-600">{payment.description}</p>
                        <p className="text-gray-600">Agent: {payment.agent}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Due Date</p>
                        <p className="text-gray-600">{new Date(payment.dueDate).toLocaleDateString()}</p>
                        {payment.status === 'pending' && (
                          <p className={`text-xs ${
                            getDaysUntilDue(payment.dueDate) < 0 ? 'text-red-600' :
                            getDaysUntilDue(payment.dueDate) <= 7 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {getDaysUntilDue(payment.dueDate) < 0 
                              ? `${Math.abs(getDaysUntilDue(payment.dueDate))} days overdue`
                              : `${getDaysUntilDue(payment.dueDate)} days remaining`
                            }
                          </p>
                        )}
                        {payment.paidDate && (
                          <p className="text-green-600 text-xs">
                            Paid: {new Date(payment.paidDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Amount</p>
                        <p className="text-lg font-bold text-green-600">{formatPrice(payment.amount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-40">
                    {payment.status === 'pending' && (
                      <Button size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Paid
                      </Button>
                    )}
                    {payment.status === 'overdue' && (
                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                        <Bell className="h-4 w-4 mr-2" />
                        Follow Up
                      </Button>
                    )}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {sortedPayments.length > 10 && (
            <div className="text-center mt-4">
              <Button variant="outline">
                Load More Payments ({sortedPayments.length - 10} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
