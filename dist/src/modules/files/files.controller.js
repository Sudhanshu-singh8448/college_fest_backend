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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const request_upload_url_dto_1 = require("./dto/request-upload-url.dto");
const confirm_upload_dto_1 = require("./dto/confirm-upload.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    requestUploadUrl(dto, user) {
        return this.filesService.requestUploadUrl(user.id, dto);
    }
    confirmUpload(dto, user) {
        return this.filesService.confirmUpload(user.id, dto);
    }
    getDownloadUrl(id, user) {
        return this.filesService.getDownloadUrl(id, user.id);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request a pre-signed S3/R2 PUT URL for direct client-side upload',
        description: 'Returns a signed URL valid for 10 minutes. Upload the file directly from the client to this URL. Then call /confirm.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_upload_url_dto_1.RequestUploadUrlDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "requestUploadUrl", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm a completed file upload',
        description: 'Verifies the file exists in storage via HeadObject and marks the file record as CONFIRMED.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_upload_dto_1.ConfirmUploadDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "confirmUpload", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a short-lived signed download URL (5 min)',
        description: 'Generates a pre-signed GET URL for private file access.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getDownloadUrl", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map