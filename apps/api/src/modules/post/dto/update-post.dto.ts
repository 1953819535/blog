import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto.js';
import { IsOptional, IsUUID, IsBoolean, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDto extends PartialType(
  OmitType(CreatePostDto, ['categoryId', 'tagIds', 'published'] as const)
) {
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? null : value)
  @IsUUID('4', { message: '分类ID必须是UUID格式' })
  categoryId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID数组必须是UUID格式' })
  tagIds?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}