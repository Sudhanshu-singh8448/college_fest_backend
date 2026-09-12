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
exports.BroadcastDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class BroadcastDto {
    title;
    message;
    priority;
    eventId;
    category;
}
exports.BroadcastDto = BroadcastDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Broadcast announcement title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Broadcast announcement body message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority: LOW, NORMAL, HIGH, URGENT', default: 'NORMAL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    __metadata("design:type", String)
], BroadcastDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional specific event ID to target; if omitted, targets all events organized by the caller' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional target club / category name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "category", void 0);
//# sourceMappingURL=broadcast.dto.js.map