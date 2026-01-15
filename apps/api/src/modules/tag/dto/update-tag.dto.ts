import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '标签名称', example: 'JavaScript', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug格式不正确，应为小写字母、数字和连字符组合，如：javascript'
  })
  @ApiProperty({ description: 'URL友好标识', example: 'javascript', required: false })
  slug?: string;
}