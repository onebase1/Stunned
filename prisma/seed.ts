import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        whatsappNumber: '+1-555-0101',
        budgetMin: 500000,
        budgetMax: 750000,
        preferredBedrooms: 3,
        preferredLocation: 'Downtown',
        leadSource: 'website',
        currentStage: 'QUALIFIED',
        priorityLevel: 'high',
        assignedAgent: 'Sarah Johnson',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0102',
        whatsappNumber: '+1-555-0102',
        budgetMin: 400000,
        budgetMax: 600000,
        preferredBedrooms: 2,
        preferredLocation: 'Midtown',
        leadSource: 'referral',
        currentStage: 'PROPERTY_MATCHED',
        priorityLevel: 'medium',
        assignedAgent: 'Michael Brown',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0103',
        whatsappNumber: '+1-555-0103',
        budgetMin: 800000,
        budgetMax: 1200000,
        preferredBedrooms: 4,
        preferredLocation: 'Uptown',
        leadSource: 'social_media',
        currentStage: 'CONTRACT',
        priorityLevel: 'high',
        assignedAgent: 'Sarah Johnson',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+1-555-0104',
        whatsappNumber: '+1-555-0104',
        budgetMin: 300000,
        budgetMax: 450000,
        preferredBedrooms: 1,
        preferredLocation: 'Suburbs',
        leadSource: 'whatsapp',
        currentStage: 'LEAD',
        priorityLevel: 'low',
        assignedAgent: 'David Lee',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'James',
        lastName: 'Taylor',
        email: 'james.taylor@email.com',
        phone: '+1-555-0105',
        whatsappNumber: '+1-555-0105',
        budgetMin: 600000,
        budgetMax: 900000,
        preferredBedrooms: 3,
        preferredLocation: 'Waterfront',
        leadSource: 'website',
        currentStage: 'CONSTRUCTION',
        priorityLevel: 'high',
        assignedAgent: 'Sarah Johnson',
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        propertyName: 'Heritage Tower A - Unit 301',
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 1850,
        price: 650000,
        location: 'Downtown',
        description: 'Luxury 3-bedroom apartment with stunning city views and premium finishes.',
        amenities: ['Pool', 'Gym', 'Concierge', 'Parking', 'Balcony'],
        constructionStatus: 'structure',
        completionPercentage: 65,
        estimatedCompletionDate: new Date('2024-12-15'),
        images: ['/images/property1-1.jpg', '/images/property1-2.jpg'],
        available: true,
      },
    }),
    prisma.property.create({
      data: {
        propertyName: 'Heritage Gardens - Villa 12',
        propertyType: 'house',
        bedrooms: 4,
        bathrooms: 3.5,
        squareFeet: 2800,
        price: 950000,
        location: 'Uptown',
        description: 'Spacious 4-bedroom villa with private garden and modern amenities.',
        amenities: ['Garden', 'Garage', 'Pool', 'Security', 'Smart Home'],
        constructionStatus: 'finishing',
        completionPercentage: 85,
        estimatedCompletionDate: new Date('2024-10-30'),
        images: ['/images/property2-1.jpg', '/images/property2-2.jpg'],
        available: true,
      },
    }),
    prisma.property.create({
      data: {
        propertyName: 'Heritage Lofts - Unit 205',
        propertyType: 'condo',
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        price: 480000,
        location: 'Midtown',
        description: 'Modern 2-bedroom loft with industrial design and city views.',
        amenities: ['Rooftop Terrace', 'Gym', 'Storage', 'High Ceilings'],
        constructionStatus: 'completed',
        completionPercentage: 100,
        actualCompletionDate: new Date('2024-08-15'),
        images: ['/images/property3-1.jpg', '/images/property3-2.jpg'],
        available: true,
      },
    }),
    prisma.property.create({
      data: {
        propertyName: 'Heritage Waterfront - Penthouse',
        propertyType: 'apartment',
        bedrooms: 4,
        bathrooms: 4,
        squareFeet: 3200,
        price: 1500000,
        location: 'Waterfront',
        description: 'Exclusive penthouse with panoramic water views and luxury amenities.',
        amenities: ['Private Elevator', 'Terrace', 'Wine Cellar', 'Spa', 'Concierge'],
        constructionStatus: 'foundation',
        completionPercentage: 25,
        estimatedCompletionDate: new Date('2025-06-30'),
        images: ['/images/property4-1.jpg', '/images/property4-2.jpg'],
        available: true,
      },
    }),
  ]);

  console.log(`✅ Created ${properties.length} properties`);

  // Create sample client-property matches
  const matches = await Promise.all([
    prisma.clientPropertyMatch.create({
      data: {
        clientId: clients[0].id,
        propertyId: properties[0].id,
        matchScore: 85,
        status: 'interested',
        notes: 'Client loves the downtown location and city views.',
      },
    }),
    prisma.clientPropertyMatch.create({
      data: {
        clientId: clients[1].id,
        propertyId: properties[2].id,
        matchScore: 92,
        status: 'viewing_scheduled',
        viewingDate: new Date('2024-08-30T14:00:00Z'),
        notes: 'Perfect match for budget and location preferences.',
      },
    }),
    prisma.clientPropertyMatch.create({
      data: {
        clientId: clients[2].id,
        propertyId: properties[1].id,
        matchScore: 88,
        status: 'offer_made',
        offerAmount: 920000,
        notes: 'Client made offer below asking price.',
      },
    }),
  ]);

  console.log(`✅ Created ${matches.length} client-property matches`);

  // Create sample interactions
  const interactions = await Promise.all([
    prisma.interaction.create({
      data: {
        clientId: clients[0].id,
        interactionType: 'email',
        channel: 'gmail',
        direction: 'outbound',
        subject: 'Welcome to Heritage100',
        messageContent: 'Thank you for your interest in Heritage100 properties. We look forward to helping you find your dream home.',
        agentName: 'Sarah Johnson',
        responseTimeMinutes: 15,
        sentiment: 'positive',
        tags: ['welcome', 'initial_contact'],
        resolved: true,
      },
    }),
    prisma.interaction.create({
      data: {
        clientId: clients[1].id,
        interactionType: 'whatsapp',
        channel: 'whatsapp',
        direction: 'inbound',
        subject: 'Property Inquiry',
        messageContent: 'Hi, I saw the Heritage Lofts property online. Can we schedule a viewing?',
        agentName: 'Michael Brown',
        responseTimeMinutes: 5,
        sentiment: 'positive',
        tags: ['inquiry', 'viewing_request'],
        resolved: true,
      },
    }),
  ]);

  console.log(`✅ Created ${interactions.length} interactions`);

  // Create sample client stages
  const stages = await Promise.all([
    prisma.clientStage.create({
      data: {
        clientId: clients[0].id,
        stageName: 'LEAD',
        stageNumber: 1,
        enteredDate: new Date('2024-08-01'),
        completedDate: new Date('2024-08-03'),
        status: 'completed',
        notes: 'Initial lead captured from website form.',
        durationDays: 2,
        assignedTo: 'Sarah Johnson',
      },
    }),
    prisma.clientStage.create({
      data: {
        clientId: clients[0].id,
        stageName: 'QUALIFIED',
        stageNumber: 2,
        enteredDate: new Date('2024-08-03'),
        status: 'active',
        notes: 'Budget verified, timeline confirmed.',
        nextAction: 'Property matching',
        assignedTo: 'Sarah Johnson',
      },
    }),
  ]);

  console.log(`✅ Created ${stages.length} client stages`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
