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
exports.SetRegFormatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SetRegFormatDto {
    regex;
    formatMap;
}
exports.SetRegFormatDto = SetRegFormatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '^(\\d{4})(\\w{2})(\\w{2})(\\d{4})$', description: 'Regex pattern to parse registration numbers' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetRegFormatDto.prototype, "regex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { '1': 'batch_year', '2': 'college_code', '3': 'branch_code', '4': 'roll_number' },
        description: 'Maps regex capture groups to their meaning',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SetRegFormatDto.prototype, "formatMap", void 0);
//# sourceMappingURL=set-reg-format.dto.js.map