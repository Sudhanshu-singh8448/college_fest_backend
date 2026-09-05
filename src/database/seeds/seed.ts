import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Roles ──────────────────────────────────────
  const roles = [
    { name: 'super_admin', description: 'System Super Admin — full access' },
    {
      name: 'admin',
      description: 'College Admin — manages settings, users, fests',
    },
    {
      name: 'finance_manager',
      description: 'Finance Manager — manages expenses & budgets',
    },
    {
      name: 'content_manager',
      description: 'Content Manager — manages announcements & content',
    },
    {
      name: 'committee_member',
      description: 'Committee Member — event review & approval',
    },
    {
      name: 'event_coordinator',
      description: 'Event Coordinator — oversees multiple events',
    },
    {
      name: 'organizer',
      description: 'Event Organizer — manages assigned events',
    },
    {
      name: 'moderator',
      description: 'Community Moderator — manages chat & groups',
    },
    {
      name: 'check_in_staff',
      description: 'Check-in Staff — scans tickets at entry',
    },
    {
      name: 'volunteer',
      description: 'Volunteer — assists with event operations',
    },
    {
      name: 'participant',
      description: 'Participant — default role for all users',
    },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    createdRoles[r.name] = r.id;
  }
  console.log(`  ✓ ${roles.length} roles seeded`);

  // ── Permissions ────────────────────────────────
  const permissions = [
    // Users
    { action: 'user:list', description: 'List/search users' },
    { action: 'user:view', description: 'View user details' },
    { action: 'user:ban', description: 'Ban/suspend/activate users' },
    // Roles
    { action: 'role:manage', description: 'Assign or remove roles' },
    // Events
    { action: 'event:create', description: 'Create new events' },
    { action: 'event:edit', description: 'Edit event details' },
    { action: 'event:delete', description: 'Delete events' },
    { action: 'event:view', description: 'View event organizer details' },
    // Registrations
    { action: 'registration:view', description: 'View event registrations' },
    {
      action: 'registration:approve',
      description: 'Approve/reject registrations',
    },
    // Groups
    { action: 'group:create', description: 'Create community groups' },
    // Fest
    { action: 'fest:manage', description: 'Create and manage fest editions' },
    { action: 'guidelines:manage', description: 'Edit fest guidelines' },
    // Attendance
    { action: 'attendance:manage', description: 'Manage event attendance' },
    { action: 'ticket:scan', description: 'Scan QR tickets for check-in' },
    // Expenses
    { action: 'expense:create', description: 'Submit expenses' },
    { action: 'expense:view', description: 'View expense reports' },
    { action: 'expense:approve', description: 'Approve/reject expenses' },
    // Workflow
    {
      action: 'workflow:configure',
      description: 'Configure approval workflows',
    },
    // Analytics
    { action: 'analytics:view', description: 'View dashboard analytics' },
    // Audit
    { action: 'audit:view', description: 'View audit logs' },
    // Settings
    { action: 'settings:manage', description: 'Manage system settings' },
    // Notifications
    {
      action: 'notification:broadcast',
      description: 'Send broadcast notifications',
    },
    // Chat
    { action: 'chat:moderate', description: 'Moderate chat messages' },
  ];

  const createdPerms: Record<string, string> = {};
  for (const perm of permissions) {
    const p = await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description },
      create: perm,
    });
    createdPerms[p.action] = p.id;
  }
  console.log(`  ✓ ${permissions.length} permissions seeded`);

  // ── Role → Permission Mapping ──────────────────
  const rolePermMap: Record<string, string[]> = {
    super_admin: permissions.map((p) => p.action), // all permissions
    admin: [
      'user:list',
      'user:view',
      'user:ban',
      'role:manage',
      'event:create',
      'event:edit',
      'event:delete',
      'event:view',
      'registration:view',
      'registration:approve',
      'group:create',
      'fest:manage',
      'guidelines:manage',
      'attendance:manage',
      'ticket:scan',
      'expense:view',
      'expense:approve',
      'workflow:configure',
      'analytics:view',
      'audit:view',
      'settings:manage',
      'notification:broadcast',
      'chat:moderate',
    ],
    finance_manager: [
      'expense:create',
      'expense:view',
      'expense:approve',
      'analytics:view',
    ],
    content_manager: [
      'event:create',
      'event:edit',
      'guidelines:manage',
      'notification:broadcast',
    ],
    committee_member: [
      'event:view',
      'registration:view',
      'registration:approve',
      'expense:view',
      'analytics:view',
    ],
    event_coordinator: [
      'event:create',
      'event:edit',
      'event:view',
      'registration:view',
      'registration:approve',
      'attendance:manage',
      'expense:create',
      'expense:view',
    ],
    organizer: [
      'event:edit',
      'event:view',
      'registration:view',
      'registration:approve',
      'attendance:manage',
      'expense:create',
    ],
    moderator: ['group:create', 'chat:moderate', 'user:list', 'user:view'],
    check_in_staff: ['ticket:scan', 'attendance:manage'],
    volunteer: ['ticket:scan'],
    participant: [], // no special permissions
  };

  for (const [roleName, permActions] of Object.entries(rolePermMap)) {
    const roleId = createdRoles[roleName];
    if (!roleId) continue;

    for (const action of permActions) {
      const permId = createdPerms[action];
      if (!permId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      });
    }
  }
  console.log(`  ✓ Role-permission mappings seeded`);

  // ── Expense Categories ─────────────────────────
  const categories = [
    'Venue',
    'Equipment',
    'Prizes',
    'Food',
    'Marketing',
    'Travel',
    'Miscellaneous',
  ];

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${categories.length} expense categories seeded`);

  // ── Badge Definitions ──────────────────────────
  const badges = [
    {
      name: 'First Blood',
      description: 'Register for your first event',
      iconUrl: '/badges/first_blood.png',
      condition: 'register_1_event',
      xpReward: 50,
    },
    {
      name: 'Fire Starter',
      description: 'Attend 3 events',
      iconUrl: '/badges/fire_starter.png',
      condition: 'attend_3_events',
      xpReward: 100,
    },
    {
      name: 'Sharpshooter',
      description: 'Complete all events in a category',
      iconUrl: '/badges/sharpshooter.png',
      condition: 'complete_category',
      xpReward: 200,
    },
    {
      name: 'Event Royalty',
      description: 'Attend 10+ events',
      iconUrl: '/badges/event_royalty.png',
      condition: 'attend_10_events',
      xpReward: 500,
    },
    {
      name: 'Speedster',
      description: 'Register within 10 min of event publish',
      iconUrl: '/badges/speedster.png',
      condition: 'fast_registration',
      xpReward: 75,
    },
    {
      name: 'Night Owl',
      description: 'Login after midnight',
      iconUrl: '/badges/night_owl.png',
      condition: 'midnight_login',
      xpReward: 25,
    },
    {
      name: 'Champion',
      description: 'Win any event',
      iconUrl: '/badges/champion.png',
      condition: 'win_event',
      xpReward: 300,
    },
    {
      name: 'Digital Native',
      description: '7 consecutive login days',
      iconUrl: '/badges/digital_native.png',
      condition: '7_day_streak',
      xpReward: 150,
    },
  ];

  for (const badge of badges) {
    await prisma.badgeDefinition.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
  console.log(`  ✓ ${badges.length} badge definitions seeded`);

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
