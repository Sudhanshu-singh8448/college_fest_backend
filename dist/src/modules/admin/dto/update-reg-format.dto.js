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
exports.UpdateRegNumberFormatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateRegNumberFormatDto {
    format;
    prefix;
}
exports.UpdateRegNumberFormatDto = UpdateRegNumberFormatDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registration number format string. Use {YEAR}, {BRANCH}, {BATCH}, {SEQ} as placeholders.',
        example: 'TG-{YEAR}-{BRANCH}-{SEQ:4}',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[A-Z0-9\-_{}:]+$/, {
        message: 'Format may only contain uppercase letters, digits, hyphens, underscores, and {PLACEHOLDER} tokens',
    }),
    __metadata("design:type", String)
], UpdateRegNumberFormatDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preview prefix (e.g. TG)', example: 'TG' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateRegNumberFormatDto.prototype, "prefix", void 0);
//# sourceMappingURL=update-reg-format.dto.js.map