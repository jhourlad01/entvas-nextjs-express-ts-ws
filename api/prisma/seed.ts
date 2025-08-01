import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.event.deleteMany({});

  // Sample event types
  const eventTypes = ['page_view', 'user_joined', 'user_disconnect', 'log', 'user_message'];
  const pages = ['home', 'profile', 'settings', 'dashboard', 'analytics'];
  const browsers = ['chrome', 'firefox', 'safari', 'edge'];

  // Generate sample events for the last 7 days
  const events = [];
  const now = new Date();
  
  for (let i = 0; i < 1000; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const userId = Math.floor(Math.random() * 100).toString();
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    events.push({
      eventType,
      userId,
      timestamp,
      metadata: {
        page: pages[Math.floor(Math.random() * pages.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  }

  // Insert events in batches
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await prisma.event.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
  }

  console.log('✓ Database seeding completed!');
  console.log(`✓ Created ${events.length} sample events`);
}

main()
  .catch((e) => {
    console.error('✓ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 