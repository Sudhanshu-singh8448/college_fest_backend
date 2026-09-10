"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🌱 Starting Comprehensive TechGram Demo Seeding...');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('1️⃣  Seeding Roles & Permissions...');
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
            create: { name, description: `${name.replace(/_/g, ' ').toUpperCase()} role` },
        });
    }
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
        organizer: ['event:create', 'event:edit', 'event:delete', 'event:view', 'registration:view', 'registration:approve', 'attendance:manage', 'ticket:scan', 'notification:broadcast', 'chat:moderate'],
        moderator: ['chat:moderate', 'feedback:manage'],
        check_in_staff: ['ticket:scan', 'attendance:manage'],
        volunteer: ['ticket:scan'],
        participant: [],
    };
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
            }
        }
    }
    console.log(`   ✅ 11 Roles & 28 Permissions mapped successfully`);
    console.log('2️⃣  Seeding Organizations, Colleges & Branches...');
    const org = await prisma.organization.upsert({
        where: { domain: 'techgram.edu' },
        update: {},
        create: {
            name: 'TechGram University System',
            domain: 'techgram.edu',
        },
    });
    const college = await prisma.college.upsert({
        where: { code: 'NIT-01' },
        update: {},
        create: {
            organizationId: org.id,
            name: 'National Institute of Technology',
            code: 'NIT-01',
        },
    });
    const cseBranch = await prisma.branch.upsert({
        where: { collegeId_code: { collegeId: college.id, code: 'CSE' } },
        update: {},
        create: {
            collegeId: college.id,
            name: 'Computer Science & Engineering',
            code: 'CSE',
        },
    });
    const eceBranch = await prisma.branch.upsert({
        where: { collegeId_code: { collegeId: college.id, code: 'ECE' } },
        update: {},
        create: {
            collegeId: college.id,
            name: 'Electronics & Communication',
            code: 'ECE',
        },
    });
    const batch2026 = await prisma.batch.upsert({
        where: { id: 'batch-2026' },
        update: {},
        create: {
            id: 'batch-2026',
            name: 'Class of 2026',
            year: 2026,
        },
    });
    console.log(`   ✅ College (${college.code}), Branches (CSE, ECE), Batch (2026) ready`);
    console.log('3️⃣  Seeding Fest Edition & Markdown Guidelines...');
    const fest = await prisma.fest.upsert({
        where: { id: 'fest-2026' },
        update: {
            isActive: true,
            name: 'TechGram Fest 2026',
            year: 2026,
        },
        create: {
            id: 'fest-2026',
            name: 'TechGram Fest 2026',
            year: 2026,
            startDate: new Date('2026-09-15T09:00:00Z'),
            endDate: new Date('2026-09-18T22:00:00Z'),
            isActive: true,
            guidelines: `## Welcome to TechGram Fest 2026 🚀

### 1. General Rules
- All participants must wear their digital or physical college badge at all times.
- Digital tickets with QR code must be presented at main festival entrance and individual event gates.
- Maintain respectful conduct with organizers, judges, volunteers, and fellow students.

### 2. Hackathon & Technical Tracks
- Plagiarism or submitting pre-built code will result in immediate disqualification.
- All code repositories must be created after the official hackathon kickoff.
- Cloud hosting vouchers ($100 AWS credits) will be distributed at desk check-in.

### 3. Cultural & Stage Events
- Green room access is reserved strictly for performing artists and stage coordinators.
- Audio and lighting requirements must be finalized with the technical desk 2 hours before performance.

### 4. Safety & Emergency
- Emergency medical desk is located adjacent to Auditorium Hall A.
- For issues, report immediately via the in-app Feedback module or contact student security.`,
        },
    });
    console.log(`   ✅ Active Fest "${fest.name}" configured`);
    console.log('4️⃣  Seeding Users across Admin, Organizer, and Participant roles...');
    const saltRounds = 10;
    const adminHash = await bcrypt.hash('Admin@2026', saltRounds);
    const orgHash = await bcrypt.hash('Organizer@2026', saltRounds);
    const studentHash = await bcrypt.hash('Student@2026', saltRounds);
    async function upsertDemoUser(params) {
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { registrationNumber: params.reg },
                    { email: params.email },
                ],
            },
        });
        let user;
        if (existing) {
            user = await prisma.user.update({
                where: { id: existing.id },
                data: {
                    registrationNumber: params.reg,
                    email: params.email,
                    passwordHash: params.passwordHash,
                    status: 'ACTIVE',
                },
            });
            await prisma.profile.upsert({
                where: { userId: user.id },
                update: {
                    firstName: params.firstName,
                    lastName: params.lastName,
                    bio: params.bio ?? 'TechGram Enthusiast',
                    collegeId: college.id,
                    branchId: params.branchId ?? cseBranch.id,
                    batchId: batch2026.id,
                },
                create: {
                    userId: user.id,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    bio: params.bio ?? 'TechGram Enthusiast',
                    collegeId: college.id,
                    branchId: params.branchId ?? cseBranch.id,
                    batchId: batch2026.id,
                },
            });
        }
        else {
            user = await prisma.user.create({
                data: {
                    registrationNumber: params.reg,
                    email: params.email,
                    passwordHash: params.passwordHash,
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            firstName: params.firstName,
                            lastName: params.lastName,
                            bio: params.bio ?? 'TechGram Enthusiast',
                            collegeId: college.id,
                            branchId: params.branchId ?? cseBranch.id,
                            batchId: batch2026.id,
                        },
                    },
                },
            });
        }
        const role = roles[params.roleName];
        if (role) {
            await prisma.userRole.upsert({
                where: { userId_roleId: { userId: user.id, roleId: role.id } },
                update: {},
                create: { userId: user.id, roleId: role.id },
            });
        }
        return user;
    }
    const adminUser = await upsertDemoUser({
        reg: '01234567890',
        email: 'admin@techgram.app',
        passwordHash: adminHash,
        firstName: 'Super',
        lastName: 'Admin',
        roleName: 'super_admin',
        bio: 'Chief Festival Administrator',
    });
    const financeUser = await upsertDemoUser({
        reg: '01234567891',
        email: 'finance@techgram.app',
        passwordHash: adminHash,
        firstName: 'Vikram',
        lastName: 'Singhania',
        roleName: 'finance_manager',
        bio: 'Finance & Treasury Head',
    });
    const organizerUser = await upsertDemoUser({
        reg: '01234567892',
        email: 'organizer@techgram.app',
        passwordHash: orgHash,
        firstName: 'Sarah',
        lastName: 'Jenkins',
        roleName: 'organizer',
        bio: 'Head of Technical Events & Hackathons',
    });
    const staffUser = await upsertDemoUser({
        reg: '01234567893',
        email: 'staff@techgram.app',
        passwordHash: orgHash,
        firstName: 'Alex',
        lastName: 'Rivera',
        roleName: 'check_in_staff',
        bio: 'Lead Check-in Coordinator & Scanner Staff',
    });
    const participant1 = await upsertDemoUser({
        reg: '01234567894',
        email: 'rahul.sharma@techgram.app',
        passwordHash: studentHash,
        firstName: 'Rahul',
        lastName: 'Sharma',
        roleName: 'participant',
        bio: 'Fullstack Dev & Open Source contributor',
        branchId: cseBranch.id,
    });
    const participant2 = await upsertDemoUser({
        reg: '01234567895',
        email: 'priya.patel@techgram.app',
        passwordHash: studentHash,
        firstName: 'Priya',
        lastName: 'Patel',
        roleName: 'participant',
        bio: 'Robotics enthusiast & competitive coder',
        branchId: eceBranch.id,
    });
    const participant3 = await upsertDemoUser({
        reg: '01234567896',
        email: 'aarav.mehta@techgram.app',
        passwordHash: studentHash,
        firstName: 'Aarav',
        lastName: 'Mehta',
        roleName: 'participant',
        bio: 'Gaming enthusiast & UI designer',
        branchId: cseBranch.id,
    });
    console.log(`   ✅ 7 Users seeded with 11-digit numbers (01234567890 to 01234567896)`);
    console.log('5️⃣  Seeding Diverse Events Across Categories...');
    const hackathon = await prisma.event.upsert({
        where: { id: 'event-hackathon-2026' },
        update: {},
        create: {
            id: 'event-hackathon-2026',
            festId: fest.id,
            name: 'Hackathon 2026: Code the Future',
            description: '36-hour non-stop hackathon focusing on AI, Web3, FinTech, and Smart Campus solutions. Build revolutionary products with mentorship from industry leaders.',
            category: 'TECHNICAL',
            status: 'REGISTRATION_OPEN',
            startDate: new Date('2026-09-15T10:00:00Z'),
            endDate: new Date('2026-09-16T22:00:00Z'),
            venue: 'Auditorium Hall A & Innovation Center',
            maxParticipants: 120,
            minTeamSize: 2,
            maxTeamSize: 4,
            isPublic: true,
            bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        },
    });
    const roboWars = await prisma.event.upsert({
        where: { id: 'event-robowars-2026' },
        update: {},
        create: {
            id: 'event-robowars-2026',
            festId: fest.id,
            name: 'RoboWars: Steel Showdown',
            description: 'Battlebot combat championship! 15kg and 30kg combat robots battle in an enclosed bulletproof arena until one machine reigns supreme.',
            category: 'TECHNICAL',
            status: 'PUBLISHED',
            startDate: new Date('2026-09-16T14:00:00Z'),
            endDate: new Date('2026-09-16T19:00:00Z'),
            venue: 'Outdoor Arena 1',
            maxParticipants: 32,
            minTeamSize: 2,
            maxTeamSize: 5,
            isPublic: true,
            bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        },
    });
    const battleBands = await prisma.event.upsert({
        where: { id: 'event-battle-bands-2026' },
        update: {},
        create: {
            id: 'event-battle-bands-2026',
            festId: fest.id,
            name: 'Battle of the Bands: Rock Mania',
            description: 'College rock and fusion bands showcase their talent live on the festival main stage with state-of-the-art concert acoustics.',
            category: 'CULTURAL',
            status: 'REGISTRATION_OPEN',
            startDate: new Date('2026-09-17T18:00:00Z'),
            endDate: new Date('2026-09-17T22:30:00Z'),
            venue: 'Open Air Amphitheater',
            maxParticipants: 16,
            minTeamSize: 3,
            maxTeamSize: 8,
            isPublic: true,
            bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        },
    });
    const valorant = await prisma.event.upsert({
        where: { id: 'event-valorant-2026' },
        update: {},
        create: {
            id: 'event-valorant-2026',
            festId: fest.id,
            name: 'Valorant Campus Championship',
            description: '5v5 tactical shooter esports tournament. Group stages, double elimination bracket, and grand finals casted live on twitch.',
            category: 'GAMING',
            status: 'STARTED',
            startDate: new Date('2026-09-15T12:00:00Z'),
            endDate: new Date('2026-09-16T20:00:00Z'),
            venue: 'Esports Gaming Lab',
            maxParticipants: 64,
            minTeamSize: 5,
            maxTeamSize: 5,
            isPublic: true,
            bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        },
    });
    const workshop = await prisma.event.upsert({
        where: { id: 'event-ai-workshop-2026' },
        update: {},
        create: {
            id: 'event-ai-workshop-2026',
            festId: fest.id,
            name: 'AI & Quantum Computing Workshop',
            description: 'Hands-on intensive masterclass on Transformers, diffusion models, and quantum circuit simulations with Qiskit.',
            category: 'WORKSHOP',
            status: 'COMPLETED',
            startDate: new Date('2026-09-14T09:00:00Z'),
            endDate: new Date('2026-09-14T17:00:00Z'),
            venue: 'Seminar Hall 2',
            maxParticipants: 200,
            minTeamSize: 1,
            maxTeamSize: 1,
            isPublic: true,
            bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        },
    });
    await prisma.eventForm.upsert({
        where: { eventId: hackathon.id },
        update: {},
        create: {
            eventId: hackathon.id,
            version: 1,
            schema: [
                { id: 'track', label: 'Preferred Track', type: 'dropdown', required: true, options: ['Artificial Intelligence', 'Web3 & Blockchain', 'Smart Campus', 'FinTech'] },
                { id: 'github', label: 'Team GitHub / Portfolio URL', type: 'text', required: true },
                { id: 'experience', label: 'Years of Coding Experience', type: 'number', required: false },
                { id: 'dietary', label: 'Dietary Preference', type: 'dropdown', required: true, options: ['Vegetarian', 'Non-Vegetarian', 'Vegan'] },
            ],
        },
    });
    await prisma.eventOrganizer.upsert({
        where: { eventId_userId: { eventId: hackathon.id, userId: organizerUser.id } },
        update: {},
        create: { eventId: hackathon.id, userId: organizerUser.id, role: 'PRIMARY' },
    });
    await prisma.eventOrganizer.upsert({
        where: { eventId_userId: { eventId: roboWars.id, userId: organizerUser.id } },
        update: {},
        create: { eventId: roboWars.id, userId: organizerUser.id, role: 'PRIMARY' },
    });
    await prisma.eventOrganizer.upsert({
        where: { eventId_userId: { eventId: valorant.id, userId: organizerUser.id } },
        update: {},
        create: { eventId: valorant.id, userId: organizerUser.id, role: 'PRIMARY' },
    });
    await prisma.eventOrganizer.upsert({
        where: { eventId_userId: { eventId: hackathon.id, userId: staffUser.id } },
        update: {},
        create: { eventId: hackathon.id, userId: staffUser.id, role: 'SECONDARY' },
    });
    console.log(`   ✅ 5 Events seeded with dynamic form schemas & organizer assignments`);
    console.log('6️⃣  Seeding Fest Registrations & Digital QR Tickets...');
    const allDemoUsers = [
        { user: adminUser, num: '0001', secret: 'SEC_ADMIN_TG2026_0001' },
        { user: financeUser, num: '0002', secret: 'SEC_FIN_TG2026_0002' },
        { user: organizerUser, num: '0003', secret: 'SEC_ORG_TG2026_0003' },
        { user: staffUser, num: '0004', secret: 'SEC_STAFF_TG2026_0004' },
        { user: participant1, num: '0005', secret: 'SEC_RAHUL_TG2026_0005' },
        { user: participant2, num: '0006', secret: 'SEC_PRIYA_TG2026_0006' },
        { user: participant3, num: '0007', secret: 'SEC_AARAV_TG2026_0007' },
    ];
    for (const item of allDemoUsers) {
        await prisma.festRegistration.upsert({
            where: { festId_userId: { festId: fest.id, userId: item.user.id } },
            update: {},
            create: { festId: fest.id, userId: item.user.id, status: 'REGISTERED' },
        });
        const ticketNumber = `TG-2026-PASS-${item.num}`;
        const existingTicket = await prisma.ticket.findFirst({
            where: {
                OR: [
                    { festId: fest.id, userId: item.user.id },
                    { ticketNumber },
                ],
            },
        });
        if (existingTicket) {
            await prisma.ticket.update({
                where: { id: existingTicket.id },
                data: {
                    festId: fest.id,
                    userId: item.user.id,
                    ticketNumber,
                    qrSecret: item.secret,
                    isActive: true,
                },
            });
        }
        else {
            await prisma.ticket.create({
                data: {
                    festId: fest.id,
                    userId: item.user.id,
                    ticketNumber,
                    qrSecret: item.secret,
                    isActive: true,
                },
            });
        }
    }
    console.log(`   ✅ 7 Scannable Fest Tickets generated (TG-2026-0001 through 0007)`);
    console.log('7️⃣  Seeding Event Registrations & Live Attendance...');
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: hackathon.id, userId: participant1.id } },
        update: { status: 'APPROVED' },
        create: {
            eventId: hackathon.id,
            userId: participant1.id,
            status: 'APPROVED',
        },
    });
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: valorant.id, userId: participant1.id } },
        update: { status: 'CHECKED_IN' },
        create: {
            eventId: valorant.id,
            userId: participant1.id,
            status: 'CHECKED_IN',
        },
    });
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: roboWars.id, userId: participant1.id } },
        update: { status: 'PENDING' },
        create: {
            eventId: roboWars.id,
            userId: participant1.id,
            status: 'PENDING',
        },
    });
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: hackathon.id, userId: participant2.id } },
        update: { status: 'APPROVED' },
        create: {
            eventId: hackathon.id,
            userId: participant2.id,
            status: 'APPROVED',
        },
    });
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: workshop.id, userId: participant2.id } },
        update: { status: 'COMPLETED' },
        create: {
            eventId: workshop.id,
            userId: participant2.id,
            status: 'COMPLETED',
        },
    });
    await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId: battleBands.id, userId: participant3.id } },
        update: { status: 'PENDING' },
        create: {
            eventId: battleBands.id,
            userId: participant3.id,
            status: 'PENDING',
        },
    });
    await prisma.attendance.upsert({
        where: { eventId_userId: { eventId: valorant.id, userId: participant1.id } },
        update: {},
        create: {
            eventId: valorant.id,
            userId: participant1.id,
            scannedBy: staffUser.id,
            scannedAt: new Date(),
        },
    });
    await prisma.attendance.upsert({
        where: { eventId_userId: { eventId: workshop.id, userId: participant2.id } },
        update: {},
        create: {
            eventId: workshop.id,
            userId: participant2.id,
            scannedBy: staffUser.id,
            scannedAt: new Date(Date.now() - 86400000),
        },
    });
    console.log(`   ✅ 6 Registrations (Approved, Pending, Checked-in) & 2 Attendance check-in scans seeded`);
    console.log('8️⃣  Seeding Expenses (Pending & Approved)...');
    const catVenue = await prisma.expenseCategory.upsert({ where: { name: 'Venue' }, update: {}, create: { name: 'Venue' } });
    const catEquip = await prisma.expenseCategory.upsert({ where: { name: 'Equipment' }, update: {}, create: { name: 'Equipment' } });
    const catPrizes = await prisma.expenseCategory.upsert({ where: { name: 'Prizes' }, update: {}, create: { name: 'Prizes' } });
    const catFood = await prisma.expenseCategory.upsert({ where: { name: 'Food & Beverages' }, update: {}, create: { name: 'Food & Beverages' } });
    await prisma.expense.createMany({
        data: [
            {
                eventId: hackathon.id,
                categoryId: catEquip.id,
                submitterId: organizerUser.id,
                amount: 35000.0,
                description: 'Server racks, high-throughput switch rentals & Cat6 cabling for Hackathon arena',
                status: 'APPROVED',
                receiptUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
            },
            {
                eventId: hackathon.id,
                categoryId: catPrizes.id,
                submitterId: organizerUser.id,
                amount: 50000.0,
                description: 'Hackathon Grand Winner Cash Prize & 3D engraved Glass Trophies',
                status: 'APPROVED',
            },
            {
                eventId: battleBands.id,
                categoryId: catVenue.id,
                submitterId: organizerUser.id,
                amount: 42000.0,
                description: 'Amphitheater Concert Trussing, Marshall Amplifiers & Shure mic kits',
                status: 'PENDING',
            },
            {
                eventId: hackathon.id,
                categoryId: catFood.id,
                submitterId: organizerUser.id,
                amount: 18500.0,
                description: 'Midnight Red Bull, cold brew coffee & pizza buffet for 120 hackathon attendees',
                status: 'PENDING',
            },
        ],
        skipDuplicates: true,
    });
    console.log(`   ✅ 4 Real Expense claims seeded (Total: ₹1,45,500 across Approved/Pending)`);
    console.log('9️⃣  Seeding Event Winners (Completed Events)...');
    await prisma.eventWinner.upsert({
        where: { eventId_position: { eventId: workshop.id, position: 1 } },
        update: {},
        create: {
            eventId: workshop.id,
            userId: participant2.id,
            position: 1,
            prize: 'NVIDIA Jetson Nano + ₹15,000 Cash',
            note: 'Best Quantum Computing Qiskit implementation project',
            recordedById: adminUser.id,
        },
    });
    await prisma.eventWinner.upsert({
        where: { eventId_position: { eventId: workshop.id, position: 2 } },
        update: {},
        create: {
            eventId: workshop.id,
            userId: participant1.id,
            position: 2,
            prize: 'Raspberry Pi 5 Kit + ₹10,000 Cash',
            note: 'Outstanding Deep Learning model latency optimization',
            recordedById: adminUser.id,
        },
    });
    console.log(`   ✅ Event winners recorded for completed workshop`);
    console.log('🔟  Seeding Gamification Profiles, Badges & Leaderboard...');
    const badgeFirstBlood = await prisma.badgeDefinition.findUnique({ where: { name: 'First Blood' } });
    const badgeFireStarter = await prisma.badgeDefinition.findUnique({ where: { name: 'Fire Starter' } });
    const badgeChampion = await prisma.badgeDefinition.findUnique({ where: { name: 'Champion' } });
    const badgeSharpshooter = await prisma.badgeDefinition.findUnique({ where: { name: 'Sharpshooter' } });
    await prisma.userXp.upsert({
        where: { userId: participant2.id },
        update: { totalXp: 1420, level: 6 },
        create: { userId: participant2.id, totalXp: 1420, level: 6 },
    });
    await prisma.userStreak.upsert({
        where: { userId: participant2.id },
        update: { currentStreak: 12, longestStreak: 15 },
        create: { userId: participant2.id, currentStreak: 12, longestStreak: 15 },
    });
    if (badgeFirstBlood)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant2.id, badgeId: badgeFirstBlood.id } }, update: {}, create: { userId: participant2.id, badgeId: badgeFirstBlood.id } });
    if (badgeChampion)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant2.id, badgeId: badgeChampion.id } }, update: {}, create: { userId: participant2.id, badgeId: badgeChampion.id } });
    if (badgeFireStarter)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant2.id, badgeId: badgeFireStarter.id } }, update: {}, create: { userId: participant2.id, badgeId: badgeFireStarter.id } });
    await prisma.userXp.upsert({
        where: { userId: participant1.id },
        update: { totalXp: 850, level: 4 },
        create: { userId: participant1.id, totalXp: 850, level: 4 },
    });
    await prisma.userStreak.upsert({
        where: { userId: participant1.id },
        update: { currentStreak: 5, longestStreak: 8 },
        create: { userId: participant1.id, currentStreak: 5, longestStreak: 8 },
    });
    if (badgeFirstBlood)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant1.id, badgeId: badgeFirstBlood.id } }, update: {}, create: { userId: participant1.id, badgeId: badgeFirstBlood.id } });
    if (badgeSharpshooter)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant1.id, badgeId: badgeSharpshooter.id } }, update: {}, create: { userId: participant1.id, badgeId: badgeSharpshooter.id } });
    await prisma.userXp.upsert({
        where: { userId: participant3.id },
        update: { totalXp: 420, level: 2 },
        create: { userId: participant3.id, totalXp: 420, level: 2 },
    });
    if (badgeFirstBlood)
        await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: participant3.id, badgeId: badgeFirstBlood.id } }, update: {}, create: { userId: participant3.id, badgeId: badgeFirstBlood.id } });
    console.log(`   ✅ Gamification profiles, streaks, and achievement badges seeded`);
    console.log('1️⃣1️⃣ Seeding Auto-assigned Community Groups...');
    const campusGroup = await prisma.group.upsert({
        where: { id: 'group-campus-all' },
        update: {},
        create: {
            id: 'group-campus-all',
            name: 'TechGram All-Campus (Official)',
            type: 'SYSTEM',
        },
    });
    const cseGroup = await prisma.group.upsert({
        where: { id: 'group-cse-dept' },
        update: {},
        create: {
            id: 'group-cse-dept',
            name: 'Computer Science & Engineering',
            type: 'SYSTEM',
        },
    });
    const batchGroup = await prisma.group.upsert({
        where: { id: 'group-batch-2026' },
        update: {},
        create: {
            id: 'group-batch-2026',
            name: 'Batch of 2026 Community',
            type: 'SYSTEM',
        },
    });
    for (const u of [participant1, participant2, participant3, organizerUser]) {
        await prisma.groupMember.upsert({
            where: { groupId_userId: { groupId: campusGroup.id, userId: u.id } },
            update: {},
            create: { groupId: campusGroup.id, userId: u.id },
        });
        await prisma.groupMember.upsert({
            where: { groupId_userId: { groupId: batchGroup.id, userId: u.id } },
            update: {},
            create: { groupId: batchGroup.id, userId: u.id },
        });
    }
    console.log(`   ✅ 3 Community groups seeded with member enrolments`);
    console.log('1️⃣2️⃣ Seeding Event Chat Rooms & Messages...');
    const hackathonChat = await prisma.conversation.upsert({
        where: { eventId: hackathon.id },
        update: {},
        create: {
            type: 'EVENT',
            eventId: hackathon.id,
            name: 'Hackathon 2026 Community',
        },
    });
    await prisma.conversationMember.upsert({
        where: { conversationId_userId: { conversationId: hackathonChat.id, userId: organizerUser.id } },
        update: { role: 'ADMIN' },
        create: { conversationId: hackathonChat.id, userId: organizerUser.id, role: 'ADMIN' },
    });
    await prisma.conversationMember.upsert({
        where: { conversationId_userId: { conversationId: hackathonChat.id, userId: participant1.id } },
        update: { role: 'MEMBER' },
        create: { conversationId: hackathonChat.id, userId: participant1.id, role: 'MEMBER' },
    });
    await prisma.conversationMember.upsert({
        where: { conversationId_userId: { conversationId: hackathonChat.id, userId: participant2.id } },
        update: { role: 'MEMBER' },
        create: { conversationId: hackathonChat.id, userId: participant2.id, role: 'MEMBER' },
    });
    const msg1 = await prisma.message.create({
        data: {
            conversationId: hackathonChat.id,
            senderId: organizerUser.id,
            content: '🚀 Welcome hackers to TechGram Hackathon 2026! Problem statements and API endpoints will be unlocked tomorrow morning at 09:00 AM.',
            type: 'TEXT',
            createdAt: new Date(Date.now() - 3600000),
        },
    });
    await prisma.message.create({
        data: {
            conversationId: hackathonChat.id,
            senderId: participant1.id,
            content: 'Awesome! Are cloud infrastructure credits provided for building generative AI models?',
            type: 'TEXT',
            replyToId: msg1.id,
            createdAt: new Date(Date.now() - 2400000),
        },
    });
    await prisma.message.create({
        data: {
            conversationId: hackathonChat.id,
            senderId: organizerUser.id,
            content: 'Yes! $100 AWS activate vouchers will be distributed at desk check-in alongside participant kits 💻✨',
            type: 'TEXT',
            createdAt: new Date(Date.now() - 1200000),
        },
    });
    console.log(`   ✅ Event Chatroom with WhatsApp-style threaded messages seeded`);
    console.log('1️⃣3️⃣ Seeding Feedback Submissions & Responses...');
    await prisma.feedback.createMany({
        data: [
            {
                userId: participant1.id,
                category: 'Event Suggestion',
                content: 'Could we please extend the Hackathon submission deadline by 1 hour on Day 2? Final Docker packaging usually takes time.',
                status: 'REVIEWED',
                adminResponse: 'Request approved by Organizing Committee! Buffer period added until 11:00 AM.',
            },
            {
                userId: participant2.id,
                category: 'App Experience',
                content: 'The new QR ticket offline access feature is incredible. Worked smoothly even with spotty cellular reception.',
                status: 'RESOLVED',
                adminResponse: 'Thank you Priya! Happy to hear the offline local vault worked well.',
            },
            {
                userId: participant3.id,
                category: 'Facilities',
                content: 'More power extension boards required near Rows 4-6 in Innovation Lab.',
                status: 'NEW',
            },
        ],
        skipDuplicates: true,
    });
    console.log(`   ✅ 3 Feedback items (New, Reviewed, Resolved) seeded`);
    console.log('1️⃣4️⃣ Seeding In-App Notifications for All Personas...');
    await prisma.notification.createMany({
        data: [
            {
                userId: participant1.id,
                type: 'REGISTRATION_APPROVED',
                title: 'Registration Approved! 🎉',
                body: 'Your registration for "Hackathon 2026: Code the Future" has been approved by the organizing committee.',
                isRead: false,
            },
            {
                userId: participant1.id,
                type: 'BADGE_EARNED',
                title: 'New Achievement Unlocked 🌟',
                body: 'You earned the "Sharpshooter" badge (+75 XP). Check your leaderboard standing!',
                isRead: true,
            },
            {
                userId: organizerUser.id,
                type: 'WORKFLOW_ACTION_REQUIRED',
                title: 'New Registration Awaiting Review',
                body: 'Participant Aarav Mehta applied for Battle of the Bands. Review registration details.',
                isRead: false,
            },
            {
                userId: adminUser.id,
                type: 'EXPENSE_APPROVED',
                title: 'Finance Alert: New Expense Submitted',
                body: 'Organizer Sarah Jenkins submitted an expense claim of ₹42,000 for Stage Rigging.',
                isRead: false,
            },
        ],
        skipDuplicates: true,
    });
    console.log(`   ✅ In-App Notifications seeded across Participant, Organizer, and Admin inboxes`);
    console.log('1️⃣5️⃣ Seeding Audit Logs for Admin Inspector...');
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: adminUser.id,
                action: 'role:assign',
                resourceType: 'UserRole',
                resourceId: organizerUser.id,
                newValue: { role: 'organizer', user: '01234567892' },
            },
            {
                actorId: organizerUser.id,
                action: 'event:create',
                resourceType: 'Event',
                resourceId: hackathon.id,
                newValue: { name: hackathon.name, capacity: 120 },
            },
            {
                actorId: adminUser.id,
                action: 'expense:approve',
                resourceType: 'Expense',
                newValue: { amount: 35000, category: 'Equipment' },
            },
        ],
        skipDuplicates: true,
    });
    console.log(`   ✅ Audit trail seeded with action history`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 COMPLETE TECHGRAM DEMO DATABASE SEEDING FINISHED!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📋 DEMO LOGIN CREDENTIALS CHEATSHEET (11-Digit Numbers):');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('1. 📱 PARTICIPANT APP (college_fest_app):');
    console.log('   • Reg No:   01234567894 (Rahul Sharma)');
    console.log('   • Password: Student@2026');
    console.log('   • Features: Active Ticket QR (TG-2026-0005), 3 Registrations,');
    console.log('               Level 4 (850 XP), 3 Groups, Hackathon Chat Room');
    console.log('   • (Alt #1): 01234567895 / Student@2026 (Priya Patel, Leaderboard #1)');
    console.log('   • (Alt #2): 01234567896 / Student@2026 (Aarav Mehta)');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('2. 📱 ORGANIZER APP (techgram_organizer):');
    console.log('   • Reg No:   01234567892 (Sarah Jenkins, Lead Organizer)');
    console.log('   • Password: Organizer@2026');
    console.log('   • Features: 3 Managed Events (Hackathon, RoboWars, Valorant),');
    console.log('               Pending Registrations to Approve/Reject,');
    console.log('               Expense Tracking, Chat Group ADMIN');
    console.log('   • (Staff):  01234567893 / Organizer@2026 (Alex Rivera, Scanner Staff)');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('3. 📱 ADMIN APP (techgram_admin):');
    console.log('   • Reg No:   01234567890 (Super Admin)');
    console.log('   • Password: Admin@2026');
    console.log('   • Features: Full System Access, Role Assignment, Fest Config,');
    console.log('               Expense Approvals, Audit Logs, Analytics & Export');
    console.log('   • (Finance):01234567891 / Admin@2026 (Vikram Singhania, Finance Head)');
    console.log('═══════════════════════════════════════════════════════════════\n');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map