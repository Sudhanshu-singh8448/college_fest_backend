import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
  ) {}

  // ── POST /events/:id/register ───────────────────
  async register(eventId: string, userId: string, dto: CreateRegistrationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { form: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.status !== 'REGISTRATION_OPEN' && event.status !== 'PUBLISHED') {
      throw new BadRequestException('Registration is not open for this event');
    }

    // Check capacity
    if (event.maxParticipants) {
      const currentRegs = await this.prisma.eventRegistration.count({
        where: { eventId, status: { notIn: ['REJECTED', 'CANCELLED'] } },
      });
      if (currentRegs >= event.maxParticipants) {
        throw new BadRequestException('Event has reached maximum capacity');
      }
    }

    // Check if already registered
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) {
      throw new ConflictException('You are already registered for this event');
    }

    // Fetch user for leader registration number
    const leaderUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, registrationNumber: true },
    });
    if (!leaderUser) throw new NotFoundException('User not found');

    // Determine team details
    const isTeamEvent =
      (event.maxTeamSize && event.maxTeamSize > 1) ||
      (event.minTeamSize && event.minTeamSize > 1);
    const answers = (dto.answers ?? {}) as Record<string, any>;
    const teamName = (answers.team_name ?? answers.teamName)?.toString()?.trim();

    let rawMembers: string[] = [];
    if (answers.members) {
      if (Array.isArray(answers.members)) {
        rawMembers = answers.members
          .map((m: any) => m?.toString()?.trim() ?? '')
          .filter(Boolean);
      } else if (typeof answers.members === 'string') {
        rawMembers = answers.members
          .split(/[,;\s]+/)
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    // Teammates excluding the leader itself
    const teammateRegNumbers = Array.from(
      new Set(
        rawMembers.filter((reg) => reg !== leaderUser.registrationNumber),
      ),
    );

    let teammateUsers: { id: string; registrationNumber: string }[] = [];

    if (isTeamEvent || teamName || teammateRegNumbers.length > 0) {
      if (teammateRegNumbers.length > 0) {
        teammateUsers = await this.prisma.user.findMany({
          where: { registrationNumber: { in: teammateRegNumbers } },
          select: { id: true, registrationNumber: true },
        });

        const foundRegs = new Set(
          teammateUsers.map((u) => u.registrationNumber),
        );
        const missingRegs = teammateRegNumbers.filter(
          (r) => !foundRegs.has(r),
        );
        if (missingRegs.length > 0) {
          throw new BadRequestException(
            `Student(s) with registration number(s) not found: ${missingRegs.join(', ')}. Please verify their 11-digit numbers.`,
          );
        }

        // Check if any teammate is already registered for this event
        const existingTeammateRegs =
          await this.prisma.eventRegistration.findMany({
            where: {
              eventId,
              userId: { in: teammateUsers.map((u) => u.id) },
              status: { notIn: ['REJECTED', 'CANCELLED'] },
            },
            include: { user: { select: { registrationNumber: true } } },
          });

        if (existingTeammateRegs.length > 0) {
          const conflictList = existingTeammateRegs
            .map((r) => r.user.registrationNumber)
            .join(', ');
          throw new ConflictException(
            `The following teammate(s) are already registered for this event: ${conflictList}`,
          );
        }
      }

      const totalTeamSize = 1 + teammateUsers.length;
      if (event.minTeamSize && totalTeamSize < event.minTeamSize) {
        throw new BadRequestException(
          `This team event requires a minimum of ${event.minTeamSize} members. Current team size is ${totalTeamSize}.`,
        );
      }
      if (event.maxTeamSize && totalTeamSize > event.maxTeamSize) {
        throw new BadRequestException(
          `This team event allows a maximum of ${event.maxTeamSize} members. Current team size is ${totalTeamSize}.`,
        );
      }
    }

    // Ensure event has an EventForm to attach submissions to
    let form = event.form;
    if (!form) {
      form = await this.prisma.eventForm.create({
        data: {
          eventId,
          schema: [],
        },
      });
    }

    const allTeamRegNumbers = [
      leaderUser.registrationNumber,
      ...teammateUsers.map((u) => u.registrationNumber),
    ];

    // Create submission and registration for Leader (auto-APPROVED for open fest)
    const leaderSubmission = await this.prisma.eventFormSubmission.create({
      data: {
        formId: form.id,
        userId,
        answers: {
          ...answers,
          team_name: teamName || undefined,
          team_leader_id: userId,
          team_leader_reg: leaderUser.registrationNumber,
          is_team_leader: true,
          members: allTeamRegNumbers,
        },
      },
    });

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        submissionId: leaderSubmission.id,
        status: 'APPROVED',
      },
    });

    // Auto-create submissions and registrations for all teammates
    for (const teammate of teammateUsers) {
      const teammateSubmission =
        await this.prisma.eventFormSubmission.create({
          data: {
            formId: form.id,
            userId: teammate.id,
            answers: {
              ...answers,
              team_name: teamName || undefined,
              team_leader_id: userId,
              team_leader_reg: leaderUser.registrationNumber,
              is_team_leader: false,
              members: allTeamRegNumbers,
            },
          },
        });

      await this.prisma.eventRegistration.create({
        data: {
          eventId,
          userId: teammate.id,
          submissionId: teammateSubmission.id,
          status: 'APPROVED',
        },
      });
    }

    // Auto-join all participants to the event community chat
    const conv = await this.prisma.conversation.upsert({
      where: { eventId },
      update: {},
      create: {
        type: 'EVENT',
        name: event.name,
        eventId,
      },
    });

    const allParticipantIds = [userId, ...teammateUsers.map((u) => u.id)];
    for (const pId of allParticipantIds) {
      await this.prisma.conversationMember.upsert({
        where: {
          conversationId_userId: {
            conversationId: conv.id,
            userId: pId,
          },
        },
        update: {},
        create: {
          conversationId: conv.id,
          userId: pId,
          role: 'MEMBER',
        },
      });
    }

    // Create private Team Chat if teamName is given and there are teammates
    if (teamName && allParticipantIds.length > 1) {
      try {
        const teamConv = await this.prisma.conversation.create({
          data: {
            type: 'CUSTOM',
            name: `Team: ${teamName} (${event.name})`,
            eventId,
          },
        });

        for (const pId of allParticipantIds) {
          await this.prisma.conversationMember.create({
            data: {
              conversationId: teamConv.id,
              userId: pId,
              role: pId === userId ? 'ADMIN' : 'MEMBER',
            },
          });
        }
      } catch {
        // Silently continue if team chat creation hits any duplicate
      }
    }

    return registration;
  }

  // ── GET /events/:id/registrations ───────────────
  async getEventRegistrations(
    eventId: string,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { include: { profile: true } },
        submission: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── GET /registrations/:id ──────────────────────
  async getRegistrationById(
    id: string,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
      include: {
        event: true,
        user: { include: { profile: true } },
        submission: true,
      },
    });

    if (!registration) throw new NotFoundException('Registration not found');

    if (!hasGlobalPerm && registration.userId !== userId) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId: registration.eventId, userId } },
      });
      if (!org)
        throw new ForbiddenException(
          'You do not have access to this registration',
        );
    }

    return registration;
  }

  // ── PATCH /registrations/:id/status ─────────────
  async updateStatus(
    id: string,
    dto: UpdateRegistrationStatusDto,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });
    if (!registration) throw new NotFoundException('Registration not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: {
          eventId_userId: { eventId: registration.eventId, userId: actorId },
        },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    if (dto.status === 'REJECTED' && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason must be provided');
    }

    const updated = await this.prisma.eventRegistration.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason : null,
      },
    });

    if (dto.status === 'REJECTED' || dto.status === 'CANCELLED') {
      const conv = await this.prisma.conversation.findUnique({
        where: { eventId: registration.eventId },
      });
      if (conv) {
        const isOrg = await this.prisma.eventOrganizer.findUnique({
          where: {
            eventId_userId: {
              eventId: registration.eventId,
              userId: registration.userId,
            },
          },
        });
        if (!isOrg) {
          await this.prisma.conversationMember.deleteMany({
            where: { conversationId: conv.id, userId: registration.userId },
          });
        }
      }
    }

    return updated;
  }

  // ── POST /registrations/approve-all ─────────────
  async approveAll(eventId: string, actorId: string, hasGlobalPerm: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId: actorId } },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    const result = await this.prisma.eventRegistration.updateMany({
      where: { eventId, status: 'PENDING' },
      data: { status: 'APPROVED' },
    });

    return { message: `${result.count} registrations approved` };
  }

  // ── GET /registrations/my ───────────────────────
  async getMyRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          select: { id: true, name: true, startDate: true, status: true },
        },
        submission: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── DELETE /registrations/:id ───────────────────
  async remove(id: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });
    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.userId !== userId)
      throw new ForbiddenException(
        'You can only delete your own registrations',
      );

    await this.prisma.eventRegistration.delete({
      where: { id },
    });

    const conv = await this.prisma.conversation.findUnique({
      where: { eventId: registration.eventId },
    });
    if (conv) {
      await this.prisma.conversationMember.deleteMany({
        where: { conversationId: conv.id, userId },
      });
    }

    return { message: 'Registration deleted successfully' };
  }

  // ── GET /events/:id/registrations/export ────────
  async exportRegistrations(
    eventId: string,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    const registrations = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { include: { profile: true } },
        submission: true,
      },
    });

    // Basic export format (in a real app, generate CSV here)
    return registrations.map((reg) => ({
      registrationId: reg.id,
      status: reg.status,
      user: {
        id: reg.user.id,
        email: reg.user.email,
        registrationNumber: reg.user.registrationNumber,
        firstName: reg.user.profile?.firstName,
        lastName: reg.user.profile?.lastName,
      },
      answers: reg.submission?.answers,
      createdAt: reg.createdAt,
    }));
  }
}
