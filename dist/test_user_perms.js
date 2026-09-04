"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
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
    const permissions = Array.from(new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.action))));
    console.log("Roles:", roles);
    console.log("Permissions:", permissions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=test_user_perms.js.map