import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('Starting user migration...');

    // Create a default user for existing events
    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@entvas.com' },
      update: {},
      create: {
        email: 'default@entvas.com',
        passwordHash: await bcrypt.hash('default-password', 10),
        name: 'Default User'
      }
    });

    console.log('Created default user:', defaultUser.id);

    // Update all existing events to use the default user
    const updateResult = await prisma.event.updateMany({
      where: {
        userId: {
          not: defaultUser.id
        }
      },
      data: {
        userId: defaultUser.id
      }
    });

    console.log(`Updated ${updateResult.count} events to use default user`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers(); 