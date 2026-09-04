import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  
  if (!adminRole) {
    console.log("Admin role not found!");
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { registrationNumber: '24157127054' },
    update: {
      passwordHash: hashedPassword,
      roles: {
        deleteMany: {},
        create: [{ roleId: adminRole.id }]
      }
    },
    create: {
      registrationNumber: '24157127054',
      email: 'admin@techgram.com',
      passwordHash: hashedPassword,
      roles: {
        create: [{ roleId: adminRole.id }]
      },
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    }
  });

  console.log("✅ Admin user created/updated!");
  console.log("Registration Number:", user.registrationNumber);
  console.log("Password: password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
