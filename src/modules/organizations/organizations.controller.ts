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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SetRegFormatDto } from './dto/set-reg-format.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('api/v1/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all organizations with colleges and branches' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Create organization (requires settings:manage)' })
  async create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Update organization (requires settings:manage)' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Put(':id/reg-format')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Set registration number format (requires settings:manage)' })
  async setRegFormat(@Param('id') id: string, @Body() dto: SetRegFormatDto) {
    return this.organizationsService.setRegFormat(id, dto);
  }
}
