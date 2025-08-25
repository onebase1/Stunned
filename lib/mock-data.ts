/**
 * Mock Data for Heritage100 CRM
 * Comprehensive mock data for all database tables
 */

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stage: 'LEAD' | 'QUALIFIED' | 'PROPERTY_MATCHED' | 'VIEWING' | 'NEGOTIATION' | 'CONTRACT' | 'PAYMENT_SETUP' | 'CONSTRUCTION' | 'HANDOVER';
  source: string;
  budget: number;
  preferences: string;
  assignedAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  type: 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'PENTHOUSE';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNDER_CONSTRUCTION';
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  constructionProgress: number;
  expectedCompletion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  propertyId: string;
  totalAmount: number;
  downPayment: number;
  installmentPlan: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  signedDate: string;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  type: 'DOWN_PAYMENT' | 'INSTALLMENT' | 'FINAL_PAYMENT';
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidDate?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'SMS';
  subject: string;
  content: string;
  agentId: string;
  createdAt: string;
}

export interface ConstructionUpdate {
  id: string;
  propertyId: string;
  milestone: string;
  progress: number;
  description: string;
  images: string[];
  completedDate?: string;
  createdAt: string;
}

// Mock Data
export const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.rashid@email.com',
    phone: '+971501234567',
    stage: 'QUALIFIED',
    source: 'Website',
    budget: 2500000,
    preferences: 'Modern villa with pool, 4+ bedrooms',
    assignedAgent: 'agent-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+971509876543',
    stage: 'PROPERTY_MATCHED',
    source: 'Referral',
    budget: 1800000,
    preferences: 'Luxury apartment with sea view',
    assignedAgent: 'agent-2',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-25T11:45:00Z'
  },
  {
    id: '3',
    firstName: 'Mohammed',
    lastName: 'Hassan',
    email: 'mohammed.hassan@email.com',
    phone: '+971502345678',
    stage: 'CONTRACT',
    source: 'Social Media',
    budget: 3200000,
    preferences: 'Penthouse with panoramic views',
    assignedAgent: 'agent-1',
    createdAt: '2024-01-05T16:20:00Z',
    updatedAt: '2024-02-01T10:15:00Z'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@email.com',
    phone: '+971507654321',
    stage: 'VIEWING',
    source: 'Walk-in',
    budget: 1500000,
    preferences: 'Townhouse with garden',
    assignedAgent: 'agent-3',
    createdAt: '2024-02-01T08:30:00Z',
    updatedAt: '2024-02-05T15:20:00Z'
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Smith',
    email: 'david.smith@email.com',
    phone: '+971503456789',
    stage: 'CONSTRUCTION',
    source: 'Website',
    budget: 2800000,
    preferences: 'Modern villa with smart home features',
    assignedAgent: 'agent-2',
    createdAt: '2023-12-15T12:00:00Z',
    updatedAt: '2024-02-10T09:45:00Z'
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Beachfront Villa',
    type: 'VILLA',
    status: 'AVAILABLE',
    price: 2500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 3500,
    location: 'Palm Jumeirah, Dubai',
    description: 'Stunning beachfront villa with private beach access and panoramic sea views.',
    amenities: ['Private Beach', 'Swimming Pool', 'Gym', 'Maid Room', 'Garden'],
    images: ['villa1-1.jpg', 'villa1-2.jpg', 'villa1-3.jpg'],
    constructionProgress: 100,
    expectedCompletion: '2024-03-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Modern Downtown Apartment',
    type: 'APARTMENT',
    status: 'UNDER_CONSTRUCTION',
    price: 1800000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    location: 'Downtown Dubai',
    description: 'Contemporary apartment with city skyline views and premium finishes.',
    amenities: ['Gym', 'Pool', 'Concierge', 'Parking', 'Balcony'],
    images: ['apt2-1.jpg', 'apt2-2.jpg'],
    constructionProgress: 75,
    expectedCompletion: '2024-06-15T00:00:00Z',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Executive Penthouse',
    type: 'PENTHOUSE',
    status: 'RESERVED',
    price: 3200000,
    bedrooms: 5,
    bathrooms: 6,
    area: 4500,
    location: 'Business Bay, Dubai',
    description: 'Exclusive penthouse with 360-degree city views and private elevator.',
    amenities: ['Private Elevator', 'Rooftop Terrace', 'Jacuzzi', 'Wine Cellar', 'Study'],
    images: ['pent3-1.jpg', 'pent3-2.jpg', 'pent3-3.jpg', 'pent3-4.jpg'],
    constructionProgress: 90,
    expectedCompletion: '2024-04-30T00:00:00Z',
    createdAt: '2023-11-15T00:00:00Z',
    updatedAt: '2024-01-30T00:00:00Z'
  },
  {
    id: '4',
    title: 'Family Townhouse',
    type: 'TOWNHOUSE',
    status: 'AVAILABLE',
    price: 1500000,
    bedrooms: 3,
    bathrooms: 4,
    area: 2800,
    location: 'Arabian Ranches, Dubai',
    description: 'Spacious family townhouse with private garden and community amenities.',
    amenities: ['Private Garden', 'Community Pool', 'Playground', 'Golf Course', 'Parking'],
    images: ['town4-1.jpg', 'town4-2.jpg'],
    constructionProgress: 100,
    expectedCompletion: '2024-02-15T00:00:00Z',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '5',
    title: 'Smart Villa with Pool',
    type: 'VILLA',
    status: 'UNDER_CONSTRUCTION',
    price: 2800000,
    bedrooms: 4,
    bathrooms: 5,
    area: 3800,
    location: 'Dubai Hills Estate',
    description: 'Ultra-modern smart villa with integrated home automation and infinity pool.',
    amenities: ['Smart Home', 'Infinity Pool', 'Home Theater', 'Wine Cellar', 'Gym'],
    images: ['villa5-1.jpg', 'villa5-2.jpg'],
    constructionProgress: 60,
    expectedCompletion: '2024-08-30T00:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-02-05T00:00:00Z'
  }
];

export const mockContracts: Contract[] = [
  {
    id: '1',
    clientId: '3',
    propertyId: '3',
    totalAmount: 3200000,
    downPayment: 640000,
    installmentPlan: '20% down, 80% over 24 months',
    status: 'ACTIVE',
    signedDate: '2024-02-01T00:00:00Z',
    completionDate: '2024-04-30T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    clientId: '5',
    propertyId: '5',
    totalAmount: 2800000,
    downPayment: 560000,
    installmentPlan: '20% down, 80% over 30 months',
    status: 'ACTIVE',
    signedDate: '2023-12-15T00:00:00Z',
    completionDate: '2024-08-30T00:00:00Z',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    contractId: '1',
    amount: 640000,
    type: 'DOWN_PAYMENT',
    status: 'PAID',
    dueDate: '2024-02-01T00:00:00Z',
    paidDate: '2024-02-01T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    contractId: '1',
    amount: 106667,
    type: 'INSTALLMENT',
    status: 'PAID',
    dueDate: '2024-03-01T00:00:00Z',
    paidDate: '2024-03-01T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '3',
    contractId: '1',
    amount: 106667,
    type: 'INSTALLMENT',
    status: 'PENDING',
    dueDate: '2024-04-01T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '4',
    contractId: '2',
    amount: 560000,
    type: 'DOWN_PAYMENT',
    status: 'PAID',
    dueDate: '2023-12-15T00:00:00Z',
    paidDate: '2023-12-15T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '5',
    contractId: '2',
    amount: 74667,
    type: 'INSTALLMENT',
    status: 'PAID',
    dueDate: '2024-01-15T00:00:00Z',
    paidDate: '2024-01-15T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    contractId: '2',
    amount: 74667,
    type: 'INSTALLMENT',
    status: 'PENDING',
    dueDate: '2024-02-15T00:00:00Z',
    paymentMethod: 'Bank Transfer',
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  }
];

export const mockInteractions: Interaction[] = [
  {
    id: '1',
    clientId: '1',
    type: 'CALL',
    subject: 'Initial consultation',
    content: 'Discussed client requirements and budget. Client interested in villas with pools.',
    agentId: 'agent-1',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    clientId: '1',
    type: 'EMAIL',
    subject: 'Property recommendations',
    content: 'Sent 3 villa options matching client preferences and budget range.',
    agentId: 'agent-1',
    createdAt: '2024-01-18T14:15:00Z'
  },
  {
    id: '3',
    clientId: '2',
    type: 'MEETING',
    subject: 'Property viewing',
    content: 'Showed downtown apartment. Client very interested, discussing financing options.',
    agentId: 'agent-2',
    createdAt: '2024-01-22T11:00:00Z'
  },
  {
    id: '4',
    clientId: '3',
    type: 'WHATSAPP',
    subject: 'Contract updates',
    content: 'Shared contract draft and payment schedule. Client approved terms.',
    agentId: 'agent-1',
    createdAt: '2024-01-30T16:45:00Z'
  },
  {
    id: '5',
    clientId: '4',
    type: 'SMS',
    subject: 'Viewing reminder',
    content: 'Reminder for tomorrow\'s property viewing at 2 PM.',
    agentId: 'agent-3',
    createdAt: '2024-02-04T18:00:00Z'
  }
];

export const mockConstructionUpdates: ConstructionUpdate[] = [
  {
    id: '1',
    propertyId: '2',
    milestone: 'Foundation Complete',
    progress: 25,
    description: 'Foundation work completed successfully. Ready for structural work.',
    images: ['const-2-1.jpg'],
    completedDate: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    propertyId: '2',
    milestone: 'Structure 50% Complete',
    progress: 50,
    description: 'Structural work progressing well. 15 floors completed out of 30.',
    images: ['const-2-2.jpg', 'const-2-3.jpg'],
    completedDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    propertyId: '2',
    milestone: 'Structure 75% Complete',
    progress: 75,
    description: 'Structural work nearing completion. MEP installation started.',
    images: ['const-2-4.jpg'],
    createdAt: '2024-02-10T00:00:00Z'
  },
  {
    id: '4',
    propertyId: '5',
    milestone: 'Foundation and Basement',
    progress: 30,
    description: 'Foundation and basement levels completed. Ground floor slab in progress.',
    images: ['const-5-1.jpg'],
    completedDate: '2024-01-30T00:00:00Z',
    createdAt: '2024-01-30T00:00:00Z'
  },
  {
    id: '5',
    propertyId: '5',
    milestone: 'Ground Floor Complete',
    progress: 60,
    description: 'Ground floor structure completed. First floor work commenced.',
    images: ['const-5-2.jpg', 'const-5-3.jpg'],
    createdAt: '2024-02-08T00:00:00Z'
  }
];

// Export all mock data
export const mockData = {
  clients: mockClients,
  properties: mockProperties,
  contracts: mockContracts,
  payments: mockPayments,
  interactions: mockInteractions,
  constructionUpdates: mockConstructionUpdates
};
