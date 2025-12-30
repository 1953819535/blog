import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

// 使用OmitType排除email和password字段，避免通过此DTO更新这些字段
export class UpdateUserDto extends OmitType(CreateUserDto, ['email', 'password'] as const) {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}