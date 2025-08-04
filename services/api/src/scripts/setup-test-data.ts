import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('Setting up test data...');

    // Create user1
    const user1 = await prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        email: 'user1@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'User One'
      }
    });

    console.log('Created user1:', user1.id);

    // Create three organizations
    const org1 = await prisma.organization.create({
      data: {
        name: 'Organization 1',
        description: 'First test organization',
        userId: user1.id
      }
    });

    const org2 = await prisma.organization.create({
      data: {
        name: 'Organization 2',
        description: 'Second test organization',
        userId: user1.id
      }
    });

    const org3 = await prisma.organization.create({
      data: {
        name: 'Organization 3',
        description: 'Third test organization',
        userId: user1.id
      }
    });

    console.log('Created organizations:', {
      org1: org1.id,
      org2: org2.id,
      org3: org3.id
    });

    // Get all events and update them
    const allEvents = await prisma.event.findMany();
    console.log(`Found ${allEvents.length} events to update`);

    // Update all events to use user1
    await prisma.event.updateMany({
      data: {
        userId: user1.id
      }
    });

    console.log('Updated all events to use user1');

    // Randomly assign organizations to events (with some null)
    const organizations = [org1.id, org2.id, org3.id, null]; // null for blank organizationId
    let updatedCount = 0;

    for (const event of allEvents) {
      const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
      
      const updateData: any = {};
      if (randomOrg !== null) {
        updateData.organizationId = randomOrg;
      } else {
        updateData.organizationId = null;
      }
      
      await prisma.event.update({
        where: { id: event.id },
        data: updateData
      });
      
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} events with random organization assignments`);

    // Show distribution
    const org1Count = await prisma.event.count({ where: { organizationId: org1.id } });
    const org2Count = await prisma.event.count({ where: { organizationId: org2.id } });
    const org3Count = await prisma.event.count({ where: { organizationId: org3.id } });
    const nullCount = await prisma.event.count({ where: { organizationId: null } });

    console.log('Event distribution:');
    console.log(`- Organization 1: ${org1Count} events`);
    console.log(`- Organization 2: ${org2Count} events`);
    console.log(`- Organization 3: ${org3Count} events`);
    console.log(`- No Organization: ${nullCount} events`);

    console.log('Test data setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData(); 