import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser, Public } from '../../common/index.js';
import type { SafeUser } from './types/index.js';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: '获取当前用户信息' })
  @Get('profile')
  async getProfile(@CurrentUser() user: SafeUser) {
    return user;
  }

  @ApiOperation({ summary: '更新当前用户信息' })
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: SafeUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(user.id, updateUserDto);
  }

  @ApiOperation({ summary: '获取公开信息' })
  @Public()
  @Get('public-info')
  getPublicInfo() {
    return {
      message: '这是公开信息，无需登录即可访问',
      data: {
        totalUsers: 1000,
        activeUsers: 500,
      },
    };
  }
}