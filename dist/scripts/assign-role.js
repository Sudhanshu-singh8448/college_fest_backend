"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: npm run assign-role <registrationNumber> <roleName>');
        console.error('Available roles: super_admin, admin, organizer, participant, etc.');
        process.exit(1);
    }
    const registrationNumber = args[0];
    const roleName = args[1];
    console.log(`Assigning role "${roleName}" to user with registration number "${registrationNumber}"...`);
    const user = await prisma.user.findUnique({ where: { registrationNumber } });
    if (!user) {
        console.error(`❌ User with registration number "${registrationNumber}" not found.`);
        process.exit(1);
    }
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
        console.error(`❌ Role "${roleName}" not found.`);
        process.exit(1);
    }
    const existing = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
    });
    if (existing) {
        console.log(`✅ User "${registrationNumber}" already has role "${roleName}".`);
    }
    else {
        await prisma.userRole.create({
            data: { userId: user.id, roleId: role.id },
        });
        console.log(`✅ Successfully assigned role "${roleName}" to user "${registrationNumber}".`);
    }
}
main()
    .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=assign-role.js.map