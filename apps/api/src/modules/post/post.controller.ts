import { Controller, Get, Post as PostMethod, Body, Param, Delete, Patch, Query, ParseBoolPipe, DefaultValuePipe, } from '@nestjs/common';
import { PostService } from './post.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Post } from '@my/prisma';
import { CurrentUser, Public } from '../../common/index.js'; // 假设你的装饰器位置
import type { SafeUser } from '../users/types/index.js';

@ApiTags('文章')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  /**
   * 创建文章
   * 需要登录
   */
  @ApiOperation({ summary: '创建文章' })
  @PostMethod()
  create(
    @CurrentUser() user: SafeUser,
    @Body() createPostDto: CreatePostDto
  ): Promise<Post> {
    return this.postService.create(user.id, createPostDto);
  }

  /**
   * 获取文章列表
   * 公开接口通常只看已发布的，后台管理可能需要看所有的
   */
  @ApiOperation({ summary: '获取文章列表' })
  @ApiQuery({
    name: 'published',
    required: false,
    description: '是否只显示已发布文章 (true=仅已发布, false=所有)',
    type: Boolean
  })
  @Public()
  @Get()
  findAll(
    // 默认只查已发布的 (public view)，后台调用时传 false
    @Query('published', new DefaultValuePipe(true), ParseBoolPipe) onlyPublished: boolean
  ): Promise<Partial<Post>[]> {
    return this.postService.findAll(onlyPublished);
  }

  /**
   * 获取文章详情
   */
  @ApiOperation({ summary: '根据ID获取文章详情' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Post> {
    return this.postService.findOne(id);
  }

  /**
   * 更新文章
   * 使用 Patch 因为支持部分字段更新
   */
  @ApiOperation({ summary: '更新文章' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ): Promise<Post> {
    return this.postService.update(id, updatePostDto);
  }

  /**
   * 删除文章
   */
  @ApiOperation({ summary: '删除文章' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Post> {
    return this.postService.remove(id);
  }
}