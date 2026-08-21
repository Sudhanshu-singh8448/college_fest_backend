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
exports.SetEventWinnersDto = exports.WinnerEntryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class WinnerEntryDto {
    userId;
    position;
    prize;
    note;
}
exports.WinnerEntryDto = WinnerEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID of the winner' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WinnerEntryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position (1 = 1st place, 2 = 2nd, etc.)', example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], WinnerEntryDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Prize description', example: 'Cash Prize ₹5000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WinnerEntryDto.prototype, "prize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes about the win' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WinnerEntryDto.prototype, "note", void 0);
class SetEventWinnersDto {
    winners;
}
exports.SetEventWinnersDto = SetEventWinnersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [WinnerEntryDto], description: 'Array of winners. Replaces existing winners for this event.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WinnerEntryDto),
    __metadata("design:type", Array)
], SetEventWinnersDto.prototype, "winners", void 0);
//# sourceMappingURL=set-event-winners.dto.js.map