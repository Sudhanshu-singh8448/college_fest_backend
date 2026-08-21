import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('api/v1/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my groups' })
  async findMyGroups(@CurrentUser() user: any) {
    return this.groupsService.findMyGroups(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID (must be a member)' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.findOne(id, user.id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('group:create')
  @ApiOperation({ summary: 'Create a group (requires group:create)' })
  async create(@Body() dto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group (must be a member)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('group:create')
  @ApiOperation({ summary: 'Delete group (requires group:create)' })
  async remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get group members (must be a member)' })
  async getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.getMembers(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to group (must be a member)' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.addMember(id, dto.userId, user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from group (must be a member)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.removeMember(id, userId, user.id);
  }
}
