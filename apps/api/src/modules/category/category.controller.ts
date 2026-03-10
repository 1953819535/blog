import { Controller, Get, Post, Body, Param, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Category } from '@my/prisma';
import { Public } from '../../common/index.js';


@ApiTags('分类')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: '创建分类' })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: '获取所有分类' })
  @Public()
  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @ApiOperation({ summary: '根据ID获取分类' })
  @Public()
  @Get(':id')
  findOne(
    // 自动验证 id 是否为 uuid，不是则抛出 400 Bad Request
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: '更新分类' })
  @Patch(':id') // 优化：改为 Patch
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: '删除分类' })
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<Category> {
    return this.categoryService.remove(id);
  }
}