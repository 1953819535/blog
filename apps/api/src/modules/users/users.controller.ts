import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CurrentUser, Public } from '../../common/index.js';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '获取当前用户信息（需要认证）' })
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      message: '获取用户信息成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '获取公开信息（无需认证）' })
  @Public() // 单个方法设置为公开
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