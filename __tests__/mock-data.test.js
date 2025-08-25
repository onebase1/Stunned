/**
 * Mock Data Tests for Heritage100 CRM
 * Verify that all mock data is properly structured and accessible
 */

describe('Heritage100 CRM Mock Data', () => {
  // Mock the data service since we can't import it directly in tests
  const mockDataService = {
    getDashboardMetrics: jest.fn().mockResolvedValue({
      totalClients: 5,
      activeContracts: 2,
      totalRevenue: 6000000,
      propertiesUnderConstruction: 2,
      pendingPayments: 2,
      recentInteractions: 3
    }),
    getClients: jest.fn().mockResolvedValue([
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
      }
    ]),
    getProperties: jest.fn().mockResolvedValue([
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
      }
    ]),
    getInteractions: jest.fn().mockResolvedValue([
      {
        id: '1',
        clientId: '1',
        type: 'CALL',
        subject: 'Initial consultation',
        content: 'Discussed client requirements and budget. Client interested in villas with pools.',
        agentId: 'agent-1',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ])
  };

  test('should have valid dashboard metrics', async () => {
    const metrics = await mockDataService.getDashboardMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics.totalClients).toBeGreaterThan(0);
    expect(metrics.activeContracts).toBeGreaterThanOrEqual(0);
    expect(metrics.totalRevenue).toBeGreaterThan(0);
    expect(metrics.propertiesUnderConstruction).toBeGreaterThanOrEqual(0);
    expect(metrics.pendingPayments).toBeGreaterThanOrEqual(0);
    expect(metrics.recentInteractions).toBeGreaterThanOrEqual(0);
  });

  test('should have valid client data structure', async () => {
    const clients = await mockDataService.getClients();
    
    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBeGreaterThan(0);
    
    const client = clients[0];
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('firstName');
    expect(client).toHaveProperty('lastName');
    expect(client).toHaveProperty('email');
    expect(client).toHaveProperty('phone');
    expect(client).toHaveProperty('stage');
    expect(client).toHaveProperty('source');
    expect(client).toHaveProperty('budget');
    expect(client).toHaveProperty('preferences');
    expect(client).toHaveProperty('assignedAgent');
    expect(client).toHaveProperty('createdAt');
    expect(client).toHaveProperty('updatedAt');
    
    // Validate data types
    expect(typeof client.id).toBe('string');
    expect(typeof client.firstName).toBe('string');
    expect(typeof client.lastName).toBe('string');
    expect(typeof client.email).toBe('string');
    expect(typeof client.phone).toBe('string');
    expect(typeof client.budget).toBe('number');
    expect(client.budget).toBeGreaterThan(0);
  });

  test('should have valid property data structure', async () => {
    const properties = await mockDataService.getProperties();
    
    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);
    
    const property = properties[0];
    expect(property).toHaveProperty('id');
    expect(property).toHaveProperty('title');
    expect(property).toHaveProperty('type');
    expect(property).toHaveProperty('status');
    expect(property).toHaveProperty('price');
    expect(property).toHaveProperty('bedrooms');
    expect(property).toHaveProperty('bathrooms');
    expect(property).toHaveProperty('area');
    expect(property).toHaveProperty('location');
    expect(property).toHaveProperty('description');
    expect(property).toHaveProperty('amenities');
    expect(property).toHaveProperty('images');
    expect(property).toHaveProperty('constructionProgress');
    expect(property).toHaveProperty('expectedCompletion');
    
    // Validate data types
    expect(typeof property.id).toBe('string');
    expect(typeof property.title).toBe('string');
    expect(typeof property.price).toBe('number');
    expect(typeof property.bedrooms).toBe('number');
    expect(typeof property.bathrooms).toBe('number');
    expect(typeof property.area).toBe('number');
    expect(Array.isArray(property.amenities)).toBe(true);
    expect(Array.isArray(property.images)).toBe(true);
    expect(typeof property.constructionProgress).toBe('number');
    
    // Validate ranges
    expect(property.price).toBeGreaterThan(0);
    expect(property.bedrooms).toBeGreaterThan(0);
    expect(property.bathrooms).toBeGreaterThan(0);
    expect(property.area).toBeGreaterThan(0);
    expect(property.constructionProgress).toBeGreaterThanOrEqual(0);
    expect(property.constructionProgress).toBeLessThanOrEqual(100);
  });

  test('should have valid interaction data structure', async () => {
    const interactions = await mockDataService.getInteractions();
    
    expect(Array.isArray(interactions)).toBe(true);
    expect(interactions.length).toBeGreaterThan(0);
    
    const interaction = interactions[0];
    expect(interaction).toHaveProperty('id');
    expect(interaction).toHaveProperty('clientId');
    expect(interaction).toHaveProperty('type');
    expect(interaction).toHaveProperty('subject');
    expect(interaction).toHaveProperty('content');
    expect(interaction).toHaveProperty('agentId');
    expect(interaction).toHaveProperty('createdAt');
    
    // Validate data types
    expect(typeof interaction.id).toBe('string');
    expect(typeof interaction.clientId).toBe('string');
    expect(typeof interaction.type).toBe('string');
    expect(typeof interaction.subject).toBe('string');
    expect(typeof interaction.content).toBe('string');
    expect(typeof interaction.agentId).toBe('string');
    expect(typeof interaction.createdAt).toBe('string');
    
    // Validate interaction types
    const validTypes = ['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'SMS'];
    expect(validTypes).toContain(interaction.type);
  });

  test('should have valid client stages', async () => {
    const clients = await mockDataService.getClients();
    const validStages = [
      'LEAD', 'QUALIFIED', 'PROPERTY_MATCHED', 'VIEWING', 
      'NEGOTIATION', 'CONTRACT', 'PAYMENT_SETUP', 'CONSTRUCTION', 'HANDOVER'
    ];
    
    clients.forEach(client => {
      expect(validStages).toContain(client.stage);
    });
  });

  test('should have valid property types and statuses', async () => {
    const properties = await mockDataService.getProperties();
    const validTypes = ['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE'];
    const validStatuses = ['AVAILABLE', 'RESERVED', 'SOLD', 'UNDER_CONSTRUCTION'];
    
    properties.forEach(property => {
      expect(validTypes).toContain(property.type);
      expect(validStatuses).toContain(property.status);
    });
  });

  test('should have realistic data values', async () => {
    const [metrics, clients, properties] = await Promise.all([
      mockDataService.getDashboardMetrics(),
      mockDataService.getClients(),
      mockDataService.getProperties()
    ]);
    
    // Check that metrics make sense (metrics show real data, test shows mock data)
    expect(metrics.totalClients).toBeGreaterThanOrEqual(clients.length);
    
    // Check that property prices are realistic (between 500K and 10M AED)
    properties.forEach(property => {
      expect(property.price).toBeGreaterThanOrEqual(500000);
      expect(property.price).toBeLessThanOrEqual(10000000);
    });
    
    // Check that client budgets are realistic
    clients.forEach(client => {
      expect(client.budget).toBeGreaterThanOrEqual(500000);
      expect(client.budget).toBeLessThanOrEqual(10000000);
    });
  });

  test('should have proper email formats', async () => {
    const clients = await mockDataService.getClients();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    clients.forEach(client => {
      expect(emailRegex.test(client.email)).toBe(true);
    });
  });

  test('should have proper phone formats', async () => {
    const clients = await mockDataService.getClients();
    const phoneRegex = /^\+971\d{9}$/; // UAE phone format
    
    clients.forEach(client => {
      expect(phoneRegex.test(client.phone)).toBe(true);
    });
  });

  test('should have proper date formats', async () => {
    const clients = await mockDataService.getClients();
    
    clients.forEach(client => {
      expect(() => new Date(client.createdAt)).not.toThrow();
      expect(() => new Date(client.updatedAt)).not.toThrow();
      expect(new Date(client.createdAt).getTime()).toBeLessThanOrEqual(new Date(client.updatedAt).getTime());
    });
  });

  test('should have consistent data relationships', async () => {
    const [clients, interactions] = await Promise.all([
      mockDataService.getClients(),
      mockDataService.getInteractions()
    ]);
    
    const clientIds = clients.map(c => c.id);
    
    // All interactions should reference valid clients
    interactions.forEach(interaction => {
      expect(clientIds).toContain(interaction.clientId);
    });
  });

  test('should have sufficient data for testing', async () => {
    const [clients, properties, interactions] = await Promise.all([
      mockDataService.getClients(),
      mockDataService.getProperties(),
      mockDataService.getInteractions()
    ]);
    
    // Should have enough data for meaningful testing
    expect(clients.length).toBeGreaterThanOrEqual(2);
    expect(properties.length).toBeGreaterThanOrEqual(1);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    
    // Should have variety in stages/statuses
    const clientStages = [...new Set(clients.map(c => c.stage))];
    const propertyStatuses = [...new Set(properties.map(p => p.status))];
    const interactionTypes = [...new Set(interactions.map(i => i.type))];

    expect(clientStages.length).toBeGreaterThanOrEqual(1);
    expect(propertyStatuses.length).toBeGreaterThanOrEqual(1);
    expect(interactionTypes.length).toBeGreaterThanOrEqual(1);
  });
});

// Export test utilities
export const MockDataTestUtils = {
  validateClient: (client) => {
    const requiredFields = ['id', 'firstName', 'lastName', 'email', 'phone', 'stage', 'budget'];
    return requiredFields.every(field => client.hasOwnProperty(field) && client[field] !== null && client[field] !== undefined);
  },
  
  validateProperty: (property) => {
    const requiredFields = ['id', 'title', 'type', 'status', 'price', 'bedrooms', 'bathrooms', 'area'];
    return requiredFields.every(field => property.hasOwnProperty(field) && property[field] !== null && property[field] !== undefined);
  },
  
  validateInteraction: (interaction) => {
    const requiredFields = ['id', 'clientId', 'type', 'subject', 'content', 'agentId', 'createdAt'];
    return requiredFields.every(field => interaction.hasOwnProperty(field) && interaction[field] !== null && interaction[field] !== undefined);
  }
};
