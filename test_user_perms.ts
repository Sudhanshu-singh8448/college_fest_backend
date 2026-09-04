import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const user = await prisma.user.findUnique({
    where: { registrationNumber: '24157127054' },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.action),
      ),
    ),
  );

  console.log("Roles:", roles);
  console.log("Permissions:", permissions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
