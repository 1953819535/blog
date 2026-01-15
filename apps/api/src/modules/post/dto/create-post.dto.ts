import { IsNotEmpty, IsOptional, IsString, Matches, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  @ApiProperty({ description: '文章标题', example: 'NestJS上传文件到R2' })
  title: string;

  @IsNotEmpty({ message: 'Slug不能为空' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug格式不正确，应为小写字母、数字和连字符组合，如：nestjs-r2-upload'
  })
  @ApiProperty({ description: 'URL友好标识(唯一)', example: 'nestjs-r2-upload' })
  slug: string;

  @IsNotEmpty({ message: '文章内容不能为空' }) // 修正：原代码 IsNotEmpty 应该加上
  @IsString()
  @ApiProperty({ description: '文章内容（Markdown）', example: '# 标题\n内容...' })
  content: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '文章摘要', example: '本文介绍...', required: false })
  excerpt?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '封面图URL', example: 'https://cdn.com/cover.jpg', required: false })
  coverImage?: string;

  @IsOptional()
  @IsUUID('4', { message: '分类ID必须是UUID格式' })
  @ApiProperty({ description: '分类ID', example: 'uuid-string', required: false })
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '标签ID数组必须是UUID格式' }) // 验证数组中每个都是 UUID
  @ApiProperty({ description: '标签ID列表', example: ['uuid-1', 'uuid-2'], type: [String], required: false })
  tagIds?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: '是否直接发布', default: false, required: false })
  published?: boolean;
}