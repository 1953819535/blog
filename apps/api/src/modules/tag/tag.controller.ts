import { Controller, Get, Post, Body, Param, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { TagService } from './tag.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Tag } from '@my/prisma';
import { Public } from '../../common/index.js';

@ApiTags('标签')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  @ApiOperation({ summary: '创建标签' })
  @Post()
  create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagService.create(createTagDto);
  }

  @ApiOperation({ summary: '获取所有标签' })
  @Public()
  @Get()
  findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  @ApiOperation({ summary: '根据ID获取标签' })
  @Public()
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<Tag> {
    return this.tagService.findOne(id);
  }

  @ApiOperation({ summary: '更新标签' })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTagDto: UpdateTagDto
  ): Promise<Tag> {
    return this.tagService.update(id, updateTagDto);
  }

  @ApiOperation({ summary: '删除标签' })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<Tag> {
    return this.tagService.remove(id);
  }
}