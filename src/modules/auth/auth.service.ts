import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FestService } from '../fest/fest.service';
import { GroupsService } from '../groups/groups.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => FestService))
    private readonly festService: FestService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
  ) {}

  // ── Register ──────────────────────────────────
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });

    if (existingUser) {
      throw new ConflictException('Registration number already exists');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
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
        // Auto-create gamification entry
        userXp: {
          create: { totalXp: 0, level: 1 },
        },
        userStreaks: {
          create: { currentStreak: 0, longestStreak: 0, freezes: 2 },
        },
      },
      include: { profile: true },
    });

    // Assign default 'participant' role
    const participantRole = await this.prisma.role.findUnique({
      where: { name: 'participant' },
    });
    if (participantRole) {
      await this.prisma.userRole.create({
        data: { userId: user.id, roleId: participantRole.id },
      });
    }

    // Auto-register for active fest + generate ticket (non-blocking)
    this.festService.autoRegisterForActiveFest(user.id).catch((err) => {
      console.warn(
        `Auto-fest-registration failed for ${user.id}:`,
        err.message,
      );
    });

    // Auto-assign to matching SYSTEM groups based on reg number (non-blocking)
    this.groupsService
      .autoAssignGroups(user.id, dto.registrationNumber)
      .catch((err) => {
        console.warn(
          `Auto-group-assignment failed for ${user.id}:`,
          err.message,
        );
      });

    return this.generateTokens(user.id);
  }

  // ── Login ─────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Invalid credentials or account inactive',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  // ── Logout ────────────────────────────────────
  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      return { message: 'Logged out' };
    }

    // Revoke this token and all tokens in its family (security measure)
    await this.prisma.refreshToken.updateMany({
      where: { familyId: storedToken.familyId },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  // ── Refresh Token Rotation ────────────────────
  async refreshTokens(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // If token has been revoked, this is a reuse attempt → revoke entire family
    if (storedToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Refresh token reuse detected — all sessions revoked',
      );
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke current token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Issue new token pair in the same family
    return this.generateTokens(storedToken.userId, storedToken.familyId);
  }

  // ── Change Password ───────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens — force re-login on all devices
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  // ── Forgot Password ───────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });

    // Always return success to prevent user enumeration
    if (!user || !user.email) {
      return {
        message:
          'If the account exists and has an email, a reset link has been sent.',
      };
    }

    // Generate a reset token (store hashed, send plain to user)
    const resetToken = uuidv4();
    const resetTokenHash = this.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store the reset token as a special refresh token with a 'RESET' family
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        familyId: `RESET_${uuidv4()}`,
        expiresAt,
      },
    });

    // TODO: Send email via Resend with the resetToken
    // In development, log it
    console.log(
      `[DEV] Password reset token for ${user.registrationNumber}: ${resetToken}`,
    );

    return {
      message:
        'If the account exists and has an email, a reset link has been sent.',
    };
  }

  // ── Reset Password ────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!storedToken.familyId.startsWith('RESET_')) {
      throw new BadRequestException('Invalid token type');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke the reset token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Revoke all existing refresh tokens — force re-login
    await this.prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successfully. Please log in.' };
  }

  // ── Verify Email ──────────────────────────────
  /**
   * Verify a user's email via a token sent by email.
   * Token is stored as a special refresh token with 'VERIFY_' family prefix.
   */
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const tokenHash = this.hashToken(token);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (!storedToken.familyId.startsWith('VERIFY_')) {
      throw new BadRequestException('Invalid token type');
    }

    // Mark user email as verified by updating status (or a verified flag)
    await this.prisma.user.update({
      where: { id: storedToken.userId },
      data: { status: 'ACTIVE' }, // Confirm the account
    });

    // Revoke the verification token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    return {
      message: 'Email verified successfully. Your account is now active.',
    };
  }

  // ── Resend Verification Email ──────────────────
  /**
   * Resend the verification email for the currently authenticated user.
   */
  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email) {
      throw new BadRequestException(
        'No email address on file. Please update your profile first.',
      );
    }

    // Generate a verification token (store hashed, send plain to user)
    const verifyToken = uuidv4();
    const verifyTokenHash = this.hashToken(verifyToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Revoke any existing verification tokens for this user
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
        familyId: `VERIFY_${uuidv4()}`,
        expiresAt,
      },
    });

    // TODO: Send email via Resend with the verifyToken link
    // In development, log it
    console.log(
      `[DEV] Email verification token for ${user.registrationNumber}: ${verifyToken}`,
    );

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  // ── Internal: Generate Tokens ─────────────────

  private async generateTokens(userId: string, familyId?: string) {
    const tokenId = uuidv4();
    const family = familyId || uuidv4();
    const payload = { sub: userId, tokenId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiresIn',
        ) as any,
      }),
    ]);

    // Persist refresh token hash in DB for rotation & revocation tracking
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
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

  // ── Utility: Hash token ───────────────────────
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ── Utility: Parse expiry string ──────────────
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // 7 days default

    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
