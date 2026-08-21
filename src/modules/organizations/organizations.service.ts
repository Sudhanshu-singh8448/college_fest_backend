import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SetRegFormatDto } from './dto/set-reg-format.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /organizations ────────────────────────
  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        colleges: {
          include: {
            branches: true,
          },
        },
      },
    });
  }

  // ── GET /organizations/:id ────────────────────
  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        colleges: {
          include: {
            branches: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  // ── POST /organizations ───────────────────────
  async create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        domain: dto.domain,
      },
    });
  }

  // ── PATCH /organizations/:id ──────────────────
  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.domain !== undefined && { domain: dto.domain }),
      },
    });
  }

  // ── PUT /organizations/:id/reg-format ─────────
  async setRegFormat(id: string, dto: SetRegFormatDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Validate that the regex is valid
    try {
      new RegExp(dto.regex);
    } catch {
      throw new NotFoundException('Invalid regex pattern');
    }

    return this.prisma.registrationNumberFormat.create({
      data: {
        regex: dto.regex,
        formatMap: dto.formatMap,
      },
    });
  }
}
