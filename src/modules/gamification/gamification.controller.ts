import {
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('api/v1/gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // ── Profile ────────────────────────────────────────

  @Get('me')
  @ApiOperation({
    summary: 'Get my full gamification profile',
    description: 'Returns XP, level, level name, progress to next level, rank on leaderboard, all earned badges, and streak data.',
  })
  getMyProfile(@CurrentUser() user: any) {
    return this.gamificationService.getMyProfile(user.id);
  }

  // ── Leaderboard ────────────────────────────────────

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Get the global XP leaderboard (paginated)',
    description: 'Returns top users ranked by XP from the materialized LeaderboardCache (refreshed every 5 min).',
  })
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.gamificationService.getLeaderboard(query);
  }

  @Get('leaderboard/my-rank')
  @ApiOperation({
    summary: "Get my current leaderboard rank and surrounding context",
    description: 'Returns my rank, XP gap to the person above, and nearby rank entries.',
  })
  getMyRank(@CurrentUser() user: any) {
    return this.gamificationService.getMyRank(user.id);
  }

  // ── Badges ─────────────────────────────────────────

  @Get('badges')
  @ApiOperation({
    summary: 'Get all available badge definitions (the badge catalogue)',
    description: 'Returns all 8 badge types with their names, descriptions, icons, conditions, and XP rewards.',
  })
  getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  @Get('badges/my')
  @ApiOperation({
    summary: 'Get my earned badges',
    description: 'Returns all badges the current user has earned, with earnedAt timestamps and completion percentage.',
  })
  getMyBadges(@CurrentUser() user: any) {
    return this.gamificationService.getMyBadges(user.id);
  }

  // ── Streak ─────────────────────────────────────────

  @Post('streak/check-in')
  @ApiOperation({
    summary: 'Daily check-in to maintain login streak and earn XP',
    description: `
Awards daily XP (+10) and increments streak counter.
Idempotent within the same UTC day — safe to call multiple times.

Streak milestones:
- Day 7:  +50 XP bonus + 📱 Digital Native badge
- Day 30: +200 XP bonus

Also checks for Night Owl badge (check-in between 00:00 and 04:00).
    `.trim(),
  })
  checkIn(@CurrentUser() user: any) {
    return this.gamificationService.checkIn(user.id);
  }

  @Post('streak/freeze')
  @ApiOperation({
    summary: 'Use a streak freeze to protect your streak without checking in',
    description: `
Consumes 1 freeze from inventory (default: 3 per user).
Advances lastCheckIn to today so the streak is not broken.
Returns 409 if already checked in today.
    `.trim(),
  })
  useStreakFreeze(@CurrentUser() user: any) {
    return this.gamificationService.useStreakFreeze(user.id);
  }
}
