// Client Journey Stages
export type ClientStage = 
  | 'LEAD'
  | 'QUALIFIED'
  | 'PROPERTY_MATCHED'
  | 'VIEWING'
  | 'NEGOTIATION'
  | 'CONTRACT'
  | 'PAYMENT_SETUP'
  | 'CONSTRUCTION'
  | 'HANDOVER';

// Client Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredBedrooms?: number;
  preferredLocation?: string;
  specialRequirements?: string;
  leadSource?: string;
  currentStage: ClientStage;
  priorityLevel: 'high' | 'medium' | 'low';
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  status: 'active' | 'inactive' | 'converted' | 'lost';
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredBedrooms?: number;
  preferredLocation?: string;
  specialRequirements?: string;
  leadSource?: string;
  priorityLevel?: 'high' | 'medium' | 'low';
  assignedAgent?: string;
}

// Property Types
export interface Property {
  id: string;
  propertyName: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  price?: number;
  location?: string;
  description?: string;
  amenities?: string[];
  constructionStatus?: string;
  completionPercentage: number;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  images?: string[];
  floorPlanUrl?: string;
  virtualTourUrl?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client Property Match Types
export interface ClientPropertyMatch {
  id: string;
  clientId: string;
  propertyId: string;
  matchScore?: number;
  status?: string;
  viewingDate?: Date;
  offerAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  property?: Property;
}

// Contract Types
export interface Contract {
  id: string;
  clientId: string;
  propertyId: string;
  contractNumber?: string;
  contractType?: string;
  totalAmount?: number;
  downPayment?: number;
  contractDate?: Date;
  expectedCompletionDate?: Date;
  contractStatus?: string;
  contractFileUrl?: string;
  signedDate?: Date;
  termsConditions?: string;
  specialClauses?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  property?: Property;
}

// Payment Types
export interface PaymentPlan {
  id: string;
  contractId: string;
  clientId: string;
  totalAmount?: number;
  downPayment?: number;
  installmentAmount?: number;
  installmentFrequency?: string;
  numberOfInstallments?: number;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  paymentPlanId: string;
  clientId: string;
  installmentNumber?: number;
  amount?: number;
  dueDate?: Date;
  paidDate?: Date;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial';
  transactionReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interaction Types
export interface Interaction {
  id: string;
  clientId: string;
  interactionType?: string;
  channel?: string;
  direction?: 'inbound' | 'outbound';
  subject?: string;
  messageContent?: string;
  attachments?: string[];
  agentName?: string;
  interactionDate: Date;
  responseTimeMinutes?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
  resolved: boolean;
  createdAt: Date;
  client?: Client;
}

// Construction Update Types
export interface ConstructionUpdate {
  id: string;
  propertyId: string;
  updateDate?: Date;
  completionPercentage?: number;
  milestone?: string;
  description?: string;
  images?: string[];
  videoUrl?: string;
  nextMilestone?: string;
  estimatedNextDate?: Date;
  weatherDelays: number;
  budgetStatus?: string;
  qualityRating?: number;
  contractorNotes?: string;
  createdAt: Date;
  property?: Property;
}

// Client Stage Types
export interface ClientStageRecord {
  id: string;
  clientId: string;
  stageName: ClientStage;
  stageNumber?: number;
  enteredDate: Date;
  completedDate?: Date;
  status: 'active' | 'completed' | 'skipped';
  notes?: string;
  durationDays?: number;
  nextAction?: string;
  assignedTo?: string;
  client?: Client;
}

// Notification Types
export interface Notification {
  id: string;
  clientId?: string;
  notificationType?: string;
  title?: string;
  message?: string;
  channel?: string;
  scheduledDate?: Date;
  sentDate?: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  recipientResponse?: string;
  createdAt: Date;
  client?: Client;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalLeads: number;
  totalClients: number;
  totalProperties: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealSize: number;
  leadsThisMonth: number;
  leadsThisQuarter: number;
  leadsThisYear: number;
  propertiesUnderConstruction: number;
  upcomingHandovers: number;
  overduePayments: number;
}

export interface StageAnalytics {
  stage: ClientStage;
  count: number;
  percentage: number;
  averageDuration: number;
  conversionRate: number;
}

export interface LeadSourceAnalytics {
  source: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Form Types
export interface ClientFormData extends CreateClientData {}

export interface PropertyFormData {
  propertyName: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  price?: number;
  location?: string;
  description?: string;
  amenities?: string[];
  estimatedCompletionDate?: Date;
}

// Filter Types
export interface ClientFilters {
  stage?: ClientStage;
  priority?: 'high' | 'medium' | 'low';
  leadSource?: string;
  assignedAgent?: string;
  status?: 'active' | 'inactive' | 'converted' | 'lost';
  budgetMin?: number;
  budgetMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PropertyFilters {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  location?: string;
  constructionStatus?: string;
  available?: boolean;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'agent' | 'manager';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
