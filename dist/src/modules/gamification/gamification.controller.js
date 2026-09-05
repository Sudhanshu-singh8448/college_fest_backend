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
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gamification_service_1 = require("./gamification.service");
const leaderboard_query_dto_1 = require("./dto/leaderboard-query.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GamificationController = class GamificationController {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    getMyProfile(user) {
        return this.gamificationService.getMyProfile(user.id);
    }
    getLeaderboard(query) {
        return this.gamificationService.getLeaderboard(query);
    }
    getMyRank(user) {
        return this.gamificationService.getMyRank(user.id);
    }
    getAllBadges() {
        return this.gamificationService.getAllBadges();
    }
    getMyBadges(user) {
        return this.gamificationService.getMyBadges(user.id);
    }
    checkIn(user) {
        return this.gamificationService.checkIn(user.id);
    }
    useStreakFreeze(user) {
        return this.gamificationService.useStreakFreeze(user.id);
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my full gamification profile',
        description: 'Returns XP, level, level name, progress to next level, rank on leaderboard, all earned badges, and streak data.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get the global XP leaderboard (paginated)',
        description: 'Returns top users ranked by XP from the materialized LeaderboardCache (refreshed every 5 min).',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leaderboard_query_dto_1.LeaderboardQueryDto]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/my-rank'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my current leaderboard rank and surrounding context',
        description: 'Returns my rank, XP gap to the person above, and nearby rank entries.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "getMyRank", null);
__decorate([
    (0, common_1.Get)('badges'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all available badge definitions (the badge catalogue)',
        description: 'Returns all 8 badge types with their names, descriptions, icons, conditions, and XP rewards.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "getAllBadges", null);
__decorate([
    (0, common_1.Get)('badges/my'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my earned badges',
        description: 'Returns all badges the current user has earned, with earnedAt timestamps and completion percentage.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "getMyBadges", null);
__decorate([
    (0, common_1.Post)('streak/check-in'),
    (0, swagger_1.ApiOperation)({
        summary: 'Daily check-in to maintain login streak and earn XP',
        description: `
Awards daily XP (+10) and increments streak counter.
Idempotent within the same UTC day — safe to call multiple times.

Streak milestones:
- Day 7:  +50 XP bonus + 📱 Digital Native badge
- Day 30: +200 XP bonus

Also checks for Night Owl badge (check-in between 00:00 and 04:00).
    `.trim(),
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('streak/freeze'),
    (0, swagger_1.ApiOperation)({
        summary: 'Use a streak freeze to protect your streak without checking in',
        description: `
Consumes 1 freeze from inventory (default: 3 per user).
Advances lastCheckIn to today so the streak is not broken.
Returns 409 if already checked in today.
    `.trim(),
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GamificationController.prototype, "useStreakFreeze", null);
exports.GamificationController = GamificationController = __decorate([
    (0, swagger_1.ApiTags)('Gamification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/gamification'),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map