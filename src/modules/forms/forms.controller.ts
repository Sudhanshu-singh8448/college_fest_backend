import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { UpdateFormDto } from './dto/update-form.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Forms')
@ApiBearerAuth()
@Controller('api/v1/events/:id/form')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  @ApiOperation({ summary: 'Get event form schema' })
  async getForm(@Param('id') id: string) {
    return this.formsService.getForm(id);
  }

  @Put()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({ summary: 'Update event form schema (requires event:edit and organizer role unless global admin)' })
  async updateForm(
    @Param('id') id: string,
    @Body() dto: UpdateFormDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.formsService.updateForm(id, dto, user.id, hasGlobalPerm);
  }
}
