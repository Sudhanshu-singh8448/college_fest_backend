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
exports.RequestUploadUrlDto = exports.UPLOAD_LIMITS_MB = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
exports.UPLOAD_LIMITS_MB = {
    avatar: 5,
    event_banner: 10,
    chat_image: 15,
    chat_video: 50,
    document: 25,
    receipt: 10,
};
class RequestUploadUrlDto {
    purpose;
    contentType;
    size;
    fileName;
}
exports.RequestUploadUrlDto = RequestUploadUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['avatar', 'event_banner', 'chat_image', 'chat_video', 'document', 'receipt'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['avatar', 'event_banner', 'chat_image', 'chat_video', 'document', 'receipt']),
    __metadata("design:type", String)
], RequestUploadUrlDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the file (e.g. image/jpeg, video/mp4)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestUploadUrlDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], RequestUploadUrlDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Original file name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequestUploadUrlDto.prototype, "fileName", void 0);
//# sourceMappingURL=request-upload-url.dto.js.map