import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForm(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const form = await this.prisma.eventForm.findUnique({
      where: { eventId },
    });

    if (!form) throw new NotFoundException('Form not found for this event');

    return form;
  }

  async updateForm(eventId: string, dto: UpdateFormDto, userId: string, hasGlobalPerm: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!org) {
        throw new ForbiddenException('You are not an organizer of this event');
      }
    }

    const form = await this.prisma.eventForm.findUnique({
      where: { eventId },
    });

    if (form) {
      return this.prisma.eventForm.update({
        where: { eventId },
        data: {
          schema: dto.schema as any,
          isActive: dto.isActive !== undefined ? dto.isActive : form.isActive,
          version: { increment: 1 },
        },
      });
    } else {
      return this.prisma.eventForm.create({
        data: {
          eventId,
          schema: dto.schema as any,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          version: 1,
        },
      });
    }
  }
}
