import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '分类名称', example: '后端' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug格式不正确，应为小写字母、数字和连字符组合，如：backend'
  })
  @ApiProperty({ description: 'URL友好标识', example: 'backend' })
  slug: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '分类描述', example: '后端技术相关文章', required: false })
  description?: string;
}