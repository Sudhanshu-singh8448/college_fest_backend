import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧹 TechGram: Purging Demo Test Data For Real Production Launch');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const demoRegNumbers = [
    '01234567890',
    '01234567891',
    '01234567892',
    '01234567893',
    '01234567894',
    '01234567895',
    '01234567896',
    'ADMIN001',
    'FIN001',
    'ORG001',
    'STAFF001',
    'PART001',
    'PART002',
    'PART003',
  ];

  console.log('1️⃣  Finding demo test users...');
  const demoUsers = await prisma.user.findMany({
    where: { registrationNumber: { in: demoRegNumbers } },
    select: { id: true, registrationNumber: true },
  });

  const demoUserIds = demoUsers.map((u) => u.id);
  console.log(`   Found ${demoUserIds.length} demo user accounts to clean.`);

  if (demoUserIds.length > 0) {
    console.log('2️⃣  Deleting demo tickets & event registrations...');
    const deletedTickets = await prisma.ticket.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedTickets.count} demo tickets.`);

    const deletedEventRegs = await prisma.eventRegistration.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedEventRegs.count} event registrations.`);

    const deletedFestRegs = await prisma.festRegistration.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedFestRegs.count} fest registrations.`);

    console.log('3️⃣  Deleting demo chat messages, expenses & activity...');
    const deletedMessages = await prisma.message.deleteMany({
      where: { senderId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedMessages.count} chat messages.`);

    const deletedExpenses = await prisma.expense.deleteMany({
      where: { submitterId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedExpenses.count} demo expenses.`);

    const deletedFeedback = await prisma.feedback.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedFeedback.count} demo feedback entries.`);

    const deletedXP = await prisma.userXp.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedXP.count} gamification profiles.`);

    console.log('4️⃣  Deleting demo user profiles & user accounts...');
    const deletedProfiles = await prisma.profile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedProfiles.count} profiles.`);

    const deletedUserRoles = await prisma.userRole.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedUserRoles.count} user roles.`);

    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: demoUserIds } },
    });
    console.log(`   • Removed ${deletedUsers.count} demo user accounts.`);
  }

  // Clear demo audit logs
  await prisma.auditLog.deleteMany({});
  console.log('5️⃣  Purged audit logs.');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✨ CLEANUP COMPLETE!');
  console.log('   Organizations, Colleges, Branches, Roles & Permissions remain intact.');
  console.log('   The system is fresh and ready for real student and staff registration!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
