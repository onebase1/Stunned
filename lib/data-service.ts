/**
 * Data Service for Heritage100 CRM
 * Provides data access layer with mock data
 */

import { 
  mockData, 
  Client, 
  Property, 
  Contract, 
  Payment, 
  Interaction, 
  ConstructionUpdate 
} from './mock-data';

export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Client operations
  async getClients(filters?: {
    stage?: string;
    assignedAgent?: string;
    search?: string;
  }): Promise<Client[]> {
    let clients = [...mockData.clients];

    if (filters?.stage) {
      clients = clients.filter(client => client.stage === filters.stage);
    }

    if (filters?.assignedAgent) {
      clients = clients.filter(client => client.assignedAgent === filters.assignedAgent);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      clients = clients.filter(client => 
        client.firstName.toLowerCase().includes(searchTerm) ||
        client.lastName.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
      );
    }

    return clients;
  }

  async getClientById(id: string): Promise<Client | null> {
    return mockData.clients.find(client => client.id === id) || null;
  }

  async getClientsByStage(): Promise<Record<string, number>> {
    const stages = mockData.clients.reduce((acc, client) => {
      acc[client.stage] = (acc[client.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stages;
  }

  // Property operations
  async getProperties(filters?: {
    status?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]> {
    let properties = [...mockData.properties];

    if (filters?.status) {
      properties = properties.filter(property => property.status === filters.status);
    }

    if (filters?.type) {
      properties = properties.filter(property => property.type === filters.type);
    }

    if (filters?.minPrice) {
      properties = properties.filter(property => property.price >= filters.minPrice!);
    }

    if (filters?.maxPrice) {
      properties = properties.filter(property => property.price <= filters.maxPrice!);
    }

    return properties;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return mockData.properties.find(property => property.id === id) || null;
  }

  async getPropertiesByStatus(): Promise<Record<string, number>> {
    const statuses = mockData.properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return statuses;
  }

  // Contract operations
  async getContracts(filters?: {
    status?: string;
    clientId?: string;
  }): Promise<Contract[]> {
    let contracts = [...mockData.contracts];

    if (filters?.status) {
      contracts = contracts.filter(contract => contract.status === filters.status);
    }

    if (filters?.clientId) {
      contracts = contracts.filter(contract => contract.clientId === filters.clientId);
    }

    return contracts;
  }

  async getContractById(id: string): Promise<Contract | null> {
    return mockData.contracts.find(contract => contract.id === id) || null;
  }

  // Payment operations
  async getPayments(filters?: {
    status?: string;
    contractId?: string;
    type?: string;
  }): Promise<Payment[]> {
    let payments = [...mockData.payments];

    if (filters?.status) {
      payments = payments.filter(payment => payment.status === filters.status);
    }

    if (filters?.contractId) {
      payments = payments.filter(payment => payment.contractId === filters.contractId);
    }

    if (filters?.type) {
      payments = payments.filter(payment => payment.type === filters.type);
    }

    return payments;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return mockData.payments.find(payment => payment.id === id) || null;
  }

  async getPaymentsByStatus(): Promise<Record<string, number>> {
    const statuses = mockData.payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return statuses;
  }

  // Interaction operations
  async getInteractions(filters?: {
    clientId?: string;
    type?: string;
    agentId?: string;
  }): Promise<Interaction[]> {
    let interactions = [...mockData.interactions];

    if (filters?.clientId) {
      interactions = interactions.filter(interaction => interaction.clientId === filters.clientId);
    }

    if (filters?.type) {
      interactions = interactions.filter(interaction => interaction.type === filters.type);
    }

    if (filters?.agentId) {
      interactions = interactions.filter(interaction => interaction.agentId === filters.agentId);
    }

    return interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInteractionById(id: string): Promise<Interaction | null> {
    return mockData.interactions.find(interaction => interaction.id === id) || null;
  }

  // Construction update operations
  async getConstructionUpdates(propertyId?: string): Promise<ConstructionUpdate[]> {
    let updates = [...mockData.constructionUpdates];

    if (propertyId) {
      updates = updates.filter(update => update.propertyId === propertyId);
    }

    return updates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConstructionUpdateById(id: string): Promise<ConstructionUpdate | null> {
    return mockData.constructionUpdates.find(update => update.id === id) || null;
  }

  // Dashboard analytics
  async getDashboardMetrics(): Promise<{
    totalClients: number;
    activeContracts: number;
    totalRevenue: number;
    propertiesUnderConstruction: number;
    pendingPayments: number;
    recentInteractions: number;
  }> {
    const totalClients = mockData.clients.length;
    const activeContracts = mockData.contracts.filter(c => c.status === 'ACTIVE').length;
    const totalRevenue = mockData.contracts.reduce((sum, contract) => sum + contract.totalAmount, 0);
    const propertiesUnderConstruction = mockData.properties.filter(p => p.status === 'UNDER_CONSTRUCTION').length;
    const pendingPayments = mockData.payments.filter(p => p.status === 'PENDING').length;
    const recentInteractions = mockData.interactions.filter(i => {
      const interactionDate = new Date(i.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return interactionDate > weekAgo;
    }).length;

    return {
      totalClients,
      activeContracts,
      totalRevenue,
      propertiesUnderConstruction,
      pendingPayments,
      recentInteractions
    };
  }

  // Revenue analytics
  async getRevenueAnalytics(): Promise<{
    monthlyRevenue: { month: string; revenue: number }[];
    totalRevenue: number;
    projectedRevenue: number;
  }> {
    // Mock monthly revenue data
    const monthlyRevenue = [
      { month: 'Jan', revenue: 1200000 },
      { month: 'Feb', revenue: 1800000 },
      { month: 'Mar', revenue: 2200000 },
      { month: 'Apr', revenue: 1900000 },
      { month: 'May', revenue: 2500000 },
      { month: 'Jun', revenue: 2800000 }
    ];

    const totalRevenue = mockData.contracts.reduce((sum, contract) => sum + contract.totalAmount, 0);
    const projectedRevenue = totalRevenue * 1.25; // 25% growth projection

    return {
      monthlyRevenue,
      totalRevenue,
      projectedRevenue
    };
  }

  // Client conversion analytics
  async getClientConversionAnalytics(): Promise<{
    conversionRates: { stage: string; count: number; rate: number }[];
    totalLeads: number;
    convertedClients: number;
  }> {
    const stageOrder = ['LEAD', 'QUALIFIED', 'PROPERTY_MATCHED', 'VIEWING', 'NEGOTIATION', 'CONTRACT', 'PAYMENT_SETUP', 'CONSTRUCTION', 'HANDOVER'];
    const stageCounts = await this.getClientsByStage();
    
    const totalLeads = mockData.clients.length;
    const convertedClients = mockData.clients.filter(c => ['CONTRACT', 'PAYMENT_SETUP', 'CONSTRUCTION', 'HANDOVER'].includes(c.stage)).length;

    const conversionRates = stageOrder.map((stage, index) => ({
      stage,
      count: stageCounts[stage] || 0,
      rate: index === 0 ? 100 : ((stageCounts[stage] || 0) / totalLeads) * 100
    }));

    return {
      conversionRates,
      totalLeads,
      convertedClients
    };
  }

  // Property performance analytics
  async getPropertyPerformanceAnalytics(): Promise<{
    averagePrice: number;
    averageDaysToSell: number;
    mostPopularType: string;
    constructionProgress: { propertyId: string; title: string; progress: number }[];
  }> {
    const averagePrice = mockData.properties.reduce((sum, p) => sum + p.price, 0) / mockData.properties.length;
    const averageDaysToSell = 45; // Mock data
    
    const typeCounts = mockData.properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularType = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const constructionProgress = mockData.properties
      .filter(p => p.status === 'UNDER_CONSTRUCTION')
      .map(p => ({
        propertyId: p.id,
        title: p.title,
        progress: p.constructionProgress
      }));

    return {
      averagePrice,
      averageDaysToSell,
      mostPopularType,
      constructionProgress
    };
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();
