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
exports.CreateConversationDto = exports.ConversationType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ConversationType;
(function (ConversationType) {
    ConversationType["DIRECT"] = "DIRECT";
    ConversationType["GROUP"] = "GROUP";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
class CreateConversationDto {
    type;
    name;
    memberIds;
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ConversationType, example: 'DIRECT' }),
    (0, class_validator_1.IsEnum)(ConversationType),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group name (required for GROUP type)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of user IDs to add (required for DIRECT)', example: ['uuid-of-user'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateConversationDto.prototype, "memberIds", void 0);
//# sourceMappingURL=create-conversation.dto.js.map