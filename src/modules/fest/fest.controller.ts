import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FestService } from './fest.service';
import { CreateFestDto } from './dto/create-fest.dto';
import { UpdateFestDto } from './dto/update-fest.dto';
import { UpdateGuidelinesDto } from './dto/update-guidelines.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Fest')
@ApiBearerAuth()
@Controller('api/v1/fests')
export class FestController {
  constructor(private readonly festService: FestService) {}

  @Get()
  @ApiOperation({ summary: 'List all fest editions' })
  async findAll() {
    return this.festService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active fest' })
  async getActiveFest() {
    return this.festService.getActiveFest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fest by ID' })
  async findOne(@Param('id') id: string) {
    return this.festService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('fest:manage')
  @ApiOperation({ summary: 'Create a new fest edition (requires fest:manage)' })
  async create(@Body() dto: CreateFestDto) {
    return this.festService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('fest:manage')
  @ApiOperation({ summary: 'Update fest details (requires fest:manage)' })
  async update(@Param('id') id: string, @Body() dto: UpdateFestDto) {
    return this.festService.update(id, dto);
  }

  @Get(':id/guidelines')
  @ApiOperation({ summary: 'Get fest guidelines' })
  async getGuidelines(@Param('id') id: string) {
    return this.festService.getGuidelines(id);
  }

  @Put(':id/guidelines')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('guidelines:manage')
  @ApiOperation({ summary: 'Update fest guidelines (requires guidelines:manage)' })
  async updateGuidelines(
    @Param('id') id: string,
    @Body() dto: UpdateGuidelinesDto,
  ) {
    return this.festService.updateGuidelines(id, dto.guidelines);
  }
}
