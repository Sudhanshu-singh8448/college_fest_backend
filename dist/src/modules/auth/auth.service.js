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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma.service");
const fest_service_1 = require("../fest/fest.service");
const groups_service_1 = require("../groups/groups.service");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    festService;
    groupsService;
    constructor(prisma, jwtService, configService, festService, groupsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.festService = festService;
        this.groupsService = groupsService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { registrationNumber: dto.registrationNumber },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Registration number already exists');
        }
        if (dto.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                registrationNumber: dto.registrationNumber,
                email: dto.email,
                passwordHash,
                profile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                    },
                },
                userXp: {
                    create: { totalXp: 0, level: 1 },
                },
                userStreaks: {
                    create: { currentStreak: 0, longestStreak: 0, freezes: 2 },
                },
            },
            include: { profile: true },
        });
        const participantRole = await this.prisma.role.findUnique({
            where: { name: 'participant' },
        });
        if (participantRole) {
            await this.prisma.userRole.create({
                data: { userId: user.id, roleId: participantRole.id },
            });
        }
        this.festService.autoRegisterForActiveFest(user.id).catch((err) => {
            console.warn(`Auto-fest-registration failed for ${user.id}:`, err.message);
        });
        this.groupsService.autoAssignGroups(user.id, dto.registrationNumber).catch((err) => {
            console.warn(`Auto-group-assignment failed for ${user.id}:`, err.message);
        });
        return this.generateTokens(user.id);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { registrationNumber: dto.registrationNumber },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Invalid credentials or account inactive');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.generateTokens(user.id);
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!storedToken) {
            return { message: 'Logged out' };
        }
        await this.prisma.refreshToken.updateMany({
            where: { familyId: storedToken.familyId },
            data: { isRevoked: true },
        });
        return { message: 'Logged out successfully' };
    }
    async refreshTokens(dto) {
        const tokenHash = this.hashToken(dto.refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.isRevoked) {
            await this.prisma.refreshToken.updateMany({
                where: { familyId: storedToken.familyId },
                data: { isRevoked: true },
            });
            throw new common_1.UnauthorizedException('Refresh token reuse detected — all sessions revoked');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        return this.generateTokens(storedToken.userId, storedToken.familyId);
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
        return { message: 'Password changed successfully. Please log in again.' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { registrationNumber: dto.registrationNumber },
        });
        if (!user || !user.email) {
            return { message: 'If the account exists and has an email, a reset link has been sent.' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenHash = this.hashToken(resetToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: resetTokenHash,
                familyId: `RESET_${(0, uuid_1.v4)()}`,
                expiresAt,
            },
        });
        console.log(`[DEV] Password reset token for ${user.registrationNumber}: ${resetToken}`);
        return { message: 'If the account exists and has an email, a reset link has been sent.' };
    }
    async resetPassword(dto) {
        const tokenHash = this.hashToken(dto.token);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (!storedToken.familyId.startsWith('RESET_')) {
            throw new common_1.BadRequestException('Invalid token type');
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: storedToken.userId },
            data: { passwordHash: newPasswordHash },
        });
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: storedToken.userId, isRevoked: false },
            data: { isRevoked: true },
        });
        return { message: 'Password reset successfully. Please log in.' };
    }
    async verifyEmail(token) {
        if (!token) {
            throw new common_1.BadRequestException('Verification token is required');
        }
        const tokenHash = this.hashToken(token);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        if (!storedToken.familyId.startsWith('VERIFY_')) {
            throw new common_1.BadRequestException('Invalid token type');
        }
        await this.prisma.user.update({
            where: { id: storedToken.userId },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        return { message: 'Email verified successfully. Your account is now active.' };
    }
    async resendVerification(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.email) {
            throw new common_1.BadRequestException('No email address on file. Please update your profile first.');
        }
        const verifyToken = (0, uuid_1.v4)();
        const verifyTokenHash = this.hashToken(verifyToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.updateMany({
            where: {
                userId: user.id,
                familyId: { startsWith: 'VERIFY_' },
                isRevoked: false,
            },
            data: { isRevoked: true },
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: verifyTokenHash,
                familyId: `VERIFY_${(0, uuid_1.v4)()}`,
                expiresAt,
            },
        });
        console.log(`[DEV] Email verification token for ${user.registrationNumber}: ${verifyToken}`);
        return { message: 'Verification email sent. Please check your inbox.' };
    }
    async generateTokens(userId, familyId) {
        const tokenId = (0, uuid_1.v4)();
        const family = familyId || (0, uuid_1.v4)();
        const payload = { sub: userId, tokenId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.accessSecret'),
                expiresIn: this.configService.get('jwt.accessExpiresIn'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn'),
            }),
        ]);
        const refreshTokenHash = this.hashToken(refreshToken);
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn') || '7d';
        const expiresMs = this.parseExpiry(refreshExpiresIn);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: refreshTokenHash,
                familyId: family,
                expiresAt: new Date(Date.now() + expiresMs),
            },
        });
        return { accessToken, refreshToken };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => fest_service_1.FestService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => groups_service_1.GroupsService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        fest_service_1.FestService,
        groups_service_1.GroupsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map