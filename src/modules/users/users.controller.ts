import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Own Profile ────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile + gamification stats' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMyProfile(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Deactivate own account (soft delete)' })
  async deleteAccount(@CurrentUser() user: any) {
    return this.usersService.softDeleteUser(user.id);
  }

  // ── Admin: List / Search Users ─────────────────
  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('user:list')
  @ApiOperation({ summary: 'List/search users (requires user:list permission)' })
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.searchUsers(query || '', pagination);
  }

  // ── Admin: Get User By ID ─────────────────────
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('user:view')
  @ApiOperation({ summary: 'Get user by ID (requires user:view permission)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  // ── Admin: Ban / Suspend / Activate ───────────
  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('user:ban')
  @ApiOperation({ summary: 'Ban/suspend/activate a user (requires user:ban permission)' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(id, dto.status);
  }

  // ── Admin: Role Management ────────────────────
  @Get(':id/roles')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:manage')
  @ApiOperation({ summary: 'Get user roles (requires role:manage permission)' })
  async getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Post(':id/roles')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:manage')
  @ApiOperation({ summary: 'Assign role to user (requires role:manage permission)' })
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(id, dto.roleName);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:manage')
  @ApiOperation({ summary: 'Remove role from user (requires role:manage permission)' })
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ) {
    return this.usersService.removeRole(id, roleId);
  }
}
