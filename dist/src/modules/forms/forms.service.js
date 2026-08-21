"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getForm(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const form = await this.prisma.eventForm.findUnique({
            where: { eventId },
        });
        if (!form)
            throw new common_1.NotFoundException('Form not found for this event');
        return form;
    }
    async updateForm(eventId, dto, userId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId } },
            });
            if (!org) {
                throw new common_1.ForbiddenException('You are not an organizer of this event');
            }
        }
        const form = await this.prisma.eventForm.findUnique({
            where: { eventId },
        });
        if (form) {
            return this.prisma.eventForm.update({
                where: { eventId },
                data: {
                    schema: dto.schema,
                    isActive: dto.isActive !== undefined ? dto.isActive : form.isActive,
                    version: { increment: 1 },
                },
            });
        }
        else {
            return this.prisma.eventForm.create({
                data: {
                    eventId,
                    schema: dto.schema,
                    isActive: dto.isActive !== undefined ? dto.isActive : true,
                    version: 1,
                },
            });
        }
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map