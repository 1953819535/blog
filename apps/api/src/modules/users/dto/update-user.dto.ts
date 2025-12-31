import { IsString, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Profile 更新数据
 */
class ProfileUpdateData {
  @ApiPropertyOptional({ description: '头像 URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsString()
  @IsOptional()
  bio?: string;
}

/**
 * 更新用户 DTO
 * 支持同时更新 User 表和 Profile 表
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '账号状态' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '用户档案信息', type: ProfileUpdateData })
  @ValidateNested()
  @Type(() => ProfileUpdateData)
  @IsOptional()
  profile?: ProfileUpdateData;
}