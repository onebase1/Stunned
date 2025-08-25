import { z } from 'zod';

// Client validation schemas
export const clientStageSchema = z.enum([
  'LEAD',
  'QUALIFIED',
  'PROPERTY_MATCHED',
  'VIEWING',
  'NEGOTIATION',
  'CONTRACT',
  'PAYMENT_SETUP',
  'CONSTRUCTION',
  'HANDOVER',
]);

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  preferredBedrooms: z.number().int().positive().optional().nullable(),
  preferredLocation: z.string().max(255).optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  leadSource: z.string().max(100).optional().nullable(),
  priorityLevel: z.enum(['high', 'medium', 'low']).default('medium'),
  assignedAgent: z.string().max(100).optional().nullable(),
}).refine(
  (data) => !data.budgetMax || !data.budgetMin || data.budgetMax >= data.budgetMin,
  {
    message: 'Budget maximum must be greater than or equal to budget minimum',
    path: ['budgetMax'],
  }
);

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().uuid(),
  currentStage: clientStageSchema.optional(),
  status: z.enum(['active', 'inactive', 'converted', 'lost']).optional(),
  lastContactDate: z.date().optional().nullable(),
  nextFollowUpDate: z.date().optional().nullable(),
});

// Property validation schemas
export const createPropertySchema = z.object({
  propertyName: z.string().min(1, 'Property name is required').max(255),
  propertyType: z.string().max(100).optional().nullable(),
  bedrooms: z.number().int().positive().optional().nullable(),
  bathrooms: z.number().positive().optional().nullable(),
  squareFeet: z.number().int().positive().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  constructionStatus: z.string().max(50).optional().nullable(),
  completionPercentage: z.number().int().min(0).max(100).default(0),
  estimatedCompletionDate: z.date().optional().nullable(),
  actualCompletionDate: z.date().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  floorPlanUrl: z.string().url().optional().nullable(),
  virtualTourUrl: z.string().url().optional().nullable(),
  available: z.boolean().default(true),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().uuid(),
});

// Contract validation schemas
export const createContractSchema = z.object({
  clientId: z.string().uuid(),
  propertyId: z.string().uuid(),
  contractNumber: z.string().max(100).optional().nullable(),
  contractType: z.string().max(50).optional().nullable(),
  totalAmount: z.number().positive().optional().nullable(),
  downPayment: z.number().positive().optional().nullable(),
  contractDate: z.date().optional().nullable(),
  expectedCompletionDate: z.date().optional().nullable(),
  contractStatus: z.string().max(50).optional().nullable(),
  contractFileUrl: z.string().url().optional().nullable(),
  signedDate: z.date().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
  specialClauses: z.string().optional().nullable(),
}).refine(
  (data) => !data.downPayment || !data.totalAmount || data.downPayment <= data.totalAmount,
  {
    message: 'Down payment cannot exceed total amount',
    path: ['downPayment'],
  }
);

export const updateContractSchema = createContractSchema.partial().extend({
  id: z.string().uuid(),
});

// Payment validation schemas
export const createPaymentPlanSchema = z.object({
  contractId: z.string().uuid(),
  clientId: z.string().uuid(),
  totalAmount: z.number().positive().optional().nullable(),
  downPayment: z.number().positive().optional().nullable(),
  installmentAmount: z.number().positive().optional().nullable(),
  installmentFrequency: z.enum(['monthly', 'quarterly', 'semi-annual']).optional().nullable(),
  numberOfInstallments: z.number().int().positive().optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  status: z.enum(['active', 'completed', 'defaulted']).default('active'),
});

export const createPaymentSchema = z.object({
  paymentPlanId: z.string().uuid(),
  clientId: z.string().uuid(),
  installmentNumber: z.number().int().positive().optional().nullable(),
  amount: z.number().positive().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  paidDate: z.date().optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable(),
  paymentStatus: z.enum(['pending', 'paid', 'overdue', 'partial']),
  transactionReference: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Interaction validation schemas
export const createInteractionSchema = z.object({
  clientId: z.string().uuid(),
  interactionType: z.string().max(50).optional().nullable(),
  channel: z.string().max(50).optional().nullable(),
  direction: z.enum(['inbound', 'outbound']).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  messageContent: z.string().optional().nullable(),
  attachments: z.array(z.string().url()).default([]),
  agentName: z.string().max(100).optional().nullable(),
  interactionDate: z.date().default(() => new Date()),
  responseTimeMinutes: z.number().int().positive().optional().nullable(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional().nullable(),
  tags: z.array(z.string()).default([]),
  resolved: z.boolean().default(false),
});

// Construction update validation schemas
export const createConstructionUpdateSchema = z.object({
  propertyId: z.string().uuid(),
  updateDate: z.date().optional().nullable(),
  completionPercentage: z.number().int().min(0).max(100).optional().nullable(),
  milestone: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  videoUrl: z.string().url().optional().nullable(),
  nextMilestone: z.string().max(255).optional().nullable(),
  estimatedNextDate: z.date().optional().nullable(),
  weatherDelays: z.number().int().min(0).default(0),
  budgetStatus: z.string().max(50).optional().nullable(),
  qualityRating: z.number().int().min(1).max(10).optional().nullable(),
  contractorNotes: z.string().optional().nullable(),
});

// Client stage validation schemas
export const createClientStageSchema = z.object({
  clientId: z.string().uuid(),
  stageName: clientStageSchema,
  stageNumber: z.number().int().positive().optional().nullable(),
  enteredDate: z.date().default(() => new Date()),
  completedDate: z.date().optional().nullable(),
  status: z.enum(['active', 'completed', 'skipped']),
  notes: z.string().optional().nullable(),
  durationDays: z.number().int().positive().optional().nullable(),
  nextAction: z.string().max(255).optional().nullable(),
  assignedTo: z.string().max(100).optional().nullable(),
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  notificationType: z.string().max(50).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  message: z.string().optional().nullable(),
  channel: z.string().max(50).optional().nullable(),
  scheduledDate: z.date().optional().nullable(),
  sentDate: z.date().optional().nullable(),
  status: z.enum(['scheduled', 'sent', 'delivered', 'failed']),
  recipientResponse: z.string().optional().nullable(),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const clientFiltersSchema = z.object({
  stage: clientStageSchema.optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  leadSource: z.string().optional(),
  assignedAgent: z.string().optional(),
  status: z.enum(['active', 'inactive', 'converted', 'lost']).optional(),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
});

export const propertyFiltersSchema = z.object({
  propertyType: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().positive().optional(),
  location: z.string().optional(),
  constructionStatus: z.string().optional(),
  available: z.coerce.boolean().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().regex(/^(image|application)\//),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

// Bulk operation schemas
export const bulkUpdateClientsSchema = z.object({
  clientIds: z.array(z.string().uuid()).min(1),
  updates: updateClientSchema.omit({ id: true }),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

// Analytics query schemas
export const analyticsDateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
});

export const dashboardFiltersSchema = z.object({
  dateRange: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  agents: z.array(z.string()).optional(),
  stages: z.array(clientStageSchema).optional(),
  leadSources: z.array(z.string()).optional(),
});
