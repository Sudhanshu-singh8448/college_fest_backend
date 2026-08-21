import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit feedback (set anonymous:true to hide identity)',
    description: 'Categories: EVENT, APP, ORGANIZER, GENERAL, BUG',
  })
  create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: any) {
    return this.feedbackService.createFeedback(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List feedback — admin sees all, user sees their own non-anonymous submissions' })
  list(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('feedback:manage');
    return this.feedbackService.listFeedback(user.id, hasGlobalPerm, { status, category, page, limit });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: respond to feedback or update its status (REVIEWED/RESOLVED/DISMISSED)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('feedback:manage');
    return this.feedbackService.updateFeedback(id, user.id, hasGlobalPerm, dto);
  }
}
