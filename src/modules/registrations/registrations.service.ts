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

    if (event.status !== 'REGISTRATION_OPEN') {
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

    // TODO: Validate dto.answers against event.form.schema

    // Create submission and registration
    const submission = await this.prisma.eventFormSubmission.create({
      data: {
        formId: event.form?.id || '', // Form should exist for the event
        userId,
        answers: dto.answers,
      },
    });

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        submissionId: submission.id,
        status: 'PENDING',
      },
    });

    // Attempt to start a workflow if a generic "Event Registration" workflow exists
    const defaultWorkflow = await this.prisma.workflowDefinition.findUnique({
      where: { name: 'Event Registration Approval' },
    });

    if (defaultWorkflow) {
      await this.workflowService.startWorkflowInstance(
        defaultWorkflow.id,
        'REGISTRATION',
        registration.id,
      );
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

    return this.prisma.eventRegistration.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason : null,
      },
    });
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

    // Soft delete or just cancel? The plan says "DELETE /api/v1/registrations/:id - Owner".
    // Let's actually delete it for simplicity or mark as CANCELLED.
    await this.prisma.eventRegistration.delete({
      where: { id },
    });

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
