"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Seeding database...');
    const roleNames = [
        'super_admin', 'admin', 'finance_manager', 'content_manager',
        'committee_member', 'event_coordinator', 'organizer', 'moderator',
        'check_in_staff', 'volunteer', 'participant',
    ];
    const roles = {};
    for (const name of roleNames) {
        roles[name] = await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name.replace(/_/g, ' ')} role` },
        });
    }
    console.log(`  ✅ ${Object.keys(roles).length} roles seeded`);
    const permissionActions = [
        'user:list', 'user:view', 'user:ban', 'user:delete',
        'role:manage', 'settings:manage',
        'group:create', 'group:manage',
        'fest:manage', 'guidelines:manage',
        'event:create', 'event:edit', 'event:delete', 'event:view',
        'registration:view', 'registration:approve',
        'workflow:configure',
        'ticket:scan', 'attendance:manage',
        'chat:moderate', 'notification:broadcast',
        'expense:approve', 'expense:manage_all',
        'file:manage', 'feedback:manage', 'gamification:manage',
        'analytics:view', 'audit:view',
    ];
    const permissions = {};
    for (const action of permissionActions) {
        permissions[action] = await prisma.permission.upsert({
            where: { action },
            update: {},
            create: { action, description: action.replace(/[_:]/g, ' ') },
        });
    }
    console.log(`  ✅ ${Object.keys(permissions).length} permissions seeded`);
    const matrix = {
        super_admin: permissionActions,
        admin: [
            'user:list', 'user:view', 'user:ban', 'user:delete', 'role:manage', 'settings:manage',
            'group:create', 'group:manage', 'fest:manage', 'guidelines:manage',
            'event:create', 'event:edit', 'event:delete', 'event:view',
            'registration:view', 'registration:approve', 'workflow:configure',
            'ticket:scan', 'attendance:manage', 'chat:moderate', 'notification:broadcast',
            'expense:approve', 'expense:manage_all', 'file:manage', 'feedback:manage',
            'gamification:manage', 'analytics:view', 'audit:view',
        ],
        finance_manager: ['expense:approve', 'expense:manage_all', 'analytics:view'],
        content_manager: ['event:create', 'event:edit', 'event:view', 'guidelines:manage', 'notification:broadcast'],
        committee_member: ['event:create', 'event:edit', 'event:view', 'registration:view', 'registration:approve'],
        event_coordinator: ['event:create', 'event:edit', 'event:view', 'registration:view', 'registration:approve', 'attendance:manage'],
        organizer: ['event:edit', 'event:view', 'registration:view', 'registration:approve', 'attendance:manage', 'ticket:scan'],
        moderator: ['chat:moderate', 'feedback:manage'],
        check_in_staff: ['ticket:scan', 'attendance:manage'],
        volunteer: ['ticket:scan'],
        participant: [],
    };
    let rpCount = 0;
    for (const [roleName, permActions] of Object.entries(matrix)) {
        for (const action of permActions) {
            const role = roles[roleName];
            const perm = permissions[action];
            if (role && perm) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
                    update: {},
                    create: { roleId: role.id, permissionId: perm.id },
                });
                rpCount++;
            }
        }
    }
    console.log(`  ✅ ${rpCount} role-permission mappings seeded`);
    const categoryNames = ['Venue', 'Equipment', 'Prizes', 'Food & Beverages', 'Marketing', 'Travel', 'Miscellaneous'];
    for (const name of categoryNames) {
        await prisma.expenseCategory.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log(`  ✅ ${categoryNames.length} expense categories seeded`);
    const badges = [
        { name: 'First Blood', description: 'Register for your first event', iconUrl: '🌟', condition: 'first_registration', xpReward: 25 },
        { name: 'Fire Starter', description: 'Attend 3 events', iconUrl: '🔥', condition: 'attend_3_events', xpReward: 50 },
        { name: 'Event Royalty', description: 'Attend 10 events', iconUrl: '👑', condition: 'attend_10_events', xpReward: 100 },
        { name: 'Sharpshooter', description: 'Register within 10 minutes of event going live', iconUrl: '🎯', condition: 'quick_register', xpReward: 75 },
        { name: 'Speedster', description: 'Be in top 10 registrations for any event', iconUrl: '⚡', condition: 'top_10_register', xpReward: 50 },
        { name: 'Night Owl', description: 'Check-in between midnight and 4 AM', iconUrl: '🦉', condition: 'night_checkin', xpReward: 25 },
        { name: 'Champion', description: 'Win any event', iconUrl: '🏆', condition: 'win_event', xpReward: 150 },
        { name: 'Digital Native', description: '7-day consecutive login streak', iconUrl: '📱', condition: 'streak_7', xpReward: 75 },
    ];
    for (const badge of badges) {
        await prisma.badgeDefinition.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        });
    }
    console.log(`  ✅ ${badges.length} badge definitions seeded`);
    const settings = [
        { key: 'app.name', value: 'TechGram' },
        { key: 'app.maintenanceMode', value: 'false' },
        { key: 'reg.numberFormat', value: 'TG-{YEAR}-{BRANCH}-{SEQ:4}' },
        { key: 'reg.prefix', value: 'TG' },
        { key: 'fest.registrationOpen', value: 'true' },
    ];
    for (const s of settings) {
        await prisma.appSetting.upsert({
            where: { key: s.key },
            update: {},
            create: s,
        });
    }
    console.log(`  ✅ ${settings.length} app settings seeded`);
    const fest = await prisma.fest.upsert({
        where: { id: 'fest-2026' },
        update: {},
        create: {
            id: 'fest-2026',
            name: 'TechGram Fest 2026',
            year: 2026,
            startDate: new Date('2026-09-15'),
            endDate: new Date('2026-09-17'),
            isActive: true,
            guidelines: 'Welcome to TechGram Fest 2026! Please follow the code of conduct.',
        },
    });
    console.log(`  ✅ Fest "${fest.name}" seeded`);
    console.log('\n🎉 Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map