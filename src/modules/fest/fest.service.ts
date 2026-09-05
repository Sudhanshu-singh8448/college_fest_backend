import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFestDto } from './dto/create-fest.dto';
import { UpdateFestDto } from './dto/update-fest.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class FestService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /fests ────────────────────────────────
  async findAll() {
    return this.prisma.fest.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            events: true,
          },
        },
      },
      orderBy: { year: 'desc' },
    });
  }

  // ── GET /fests/:id ────────────────────────────
  async findOne(id: string) {
    const fest = await this.prisma.fest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
            events: true,
          },
        },
      },
    });

    if (!fest) {
      throw new NotFoundException('Fest not found');
    }

    return fest;
  }

  // ── POST /fests ───────────────────────────────
  async create(dto: CreateFestDto) {
    // If this fest is set to active, deactivate all others
    if (dto.isActive) {
      await this.prisma.fest.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.fest.create({
      data: {
        name: dto.name,
        year: dto.year,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? false,
      },
    });
  }

  // ── PATCH /fests/:id ──────────────────────────
  async update(id: string, dto: UpdateFestDto) {
    const fest = await this.prisma.fest.findUnique({ where: { id } });
    if (!fest) {
      throw new NotFoundException('Fest not found');
    }

    // If activating this fest, deactivate all others
    if (dto.isActive === true) {
      await this.prisma.fest.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return this.prisma.fest.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ── GET /fests/:id/guidelines ─────────────────
  async getGuidelines(id: string) {
    const fest = await this.prisma.fest.findUnique({
      where: { id },
      select: { id: true, name: true, guidelines: true },
    });

    if (!fest) {
      throw new NotFoundException('Fest not found');
    }

    return fest;
  }

  // ── PUT /fests/:id/guidelines ─────────────────
  async updateGuidelines(id: string, guidelines: string) {
    const fest = await this.prisma.fest.findUnique({ where: { id } });
    if (!fest) {
      throw new NotFoundException('Fest not found');
    }

    return this.prisma.fest.update({
      where: { id },
      data: { guidelines },
      select: { id: true, name: true, guidelines: true },
    });
  }

  // ── Auto-Registration ─────────────────────────
  // Called during user registration — auto-registers for active fest + generates ticket
  async autoRegisterForActiveFest(userId: string) {
    const activeFest = await this.prisma.fest.findFirst({
      where: { isActive: true },
    });

    if (!activeFest) {
      return null; // No active fest, skip
    }

    // Check if already registered
    const existing = await this.prisma.festRegistration.findUnique({
      where: {
        festId_userId: { festId: activeFest.id, userId },
      },
    });

    if (existing) {
      return existing;
    }

    // Create fest registration
    const registration = await this.prisma.festRegistration.create({
      data: {
        festId: activeFest.id,
        userId,
        status: 'REGISTERED',
      },
    });

    // Generate ticket with unique ticket number
    const ticketCount = await this.prisma.ticket.count({
      where: { festId: activeFest.id },
    });

    const ticketNumber = `TECHGRAM-${activeFest.year}-${String(ticketCount + 1).padStart(5, '0')}`;
    const qrSecret = crypto.randomBytes(32).toString('hex');

    await this.prisma.ticket.create({
      data: {
        ticketNumber,
        festId: activeFest.id,
        userId,
        qrSecret,
        isActive: true,
      },
    });

    return registration;
  }

  // ── Get Active Fest ───────────────────────────
  async getActiveFest() {
    return this.prisma.fest.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            registrations: true,
            events: true,
          },
        },
      },
    });
  }
}
