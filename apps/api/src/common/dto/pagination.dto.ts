import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @ApiProperty({ required: false })
  pageSize?: number;
}