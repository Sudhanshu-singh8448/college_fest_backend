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
//# sourceMappingURL=seed_admin.js.map