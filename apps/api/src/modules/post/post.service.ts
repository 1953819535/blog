import { Injectable, ConflictException, NotFoundException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { Post, Prisma } from '@my/prisma';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) { }

  async create(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
    const { tagIds, categoryId, published, ...rest } = createPostDto;

    // 1. 准备关联数据
    // tags: 将 ID 数组转换为 Prisma 的 connect 语法
    const tagsConnect = tagIds?.map((id) => ({ id })) || [];

    // category: 如果有值则 connect，否则 undefined
    const categoryConnect = categoryId ? { connect: { id: categoryId } } : undefined;

    // 2. 自动处理发布时间
    const publishedAt = published ? new Date() : null;

    try {
      return await this.prisma.post.create({
        data: {
          ...rest,
          published,
          publishedAt,
          // 强制绑定当前登录用户为作者
          author: { connect: { id: authorId } },
          category: categoryConnect,
          tags: { connect: tagsConnect },
        },
        // 创建成功后，返回完整的关联数据供前端使用
        include: {
          category: true,
          tags: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * 获取文章列表
   * 优化：只查询摘要(excerpt)，排除大字段(content)
   * @param onlyPublished 是否只看已发布的（前台传 true，后台管理传 false）
   */
  findAll(onlyPublished = false): Promise<Partial<Post>[]> {
    const whereCondition: Prisma.PostWhereInput = onlyPublished
      ? { published: true }
      : {};

    return this.prisma.post.findMany({
      where: whereCondition,
      orderBy: {
        // 如果是前台，按发布时间倒序；如果是后台，按创建时间倒序
        [onlyPublished ? 'publishedAt' : 'createdAt']: 'desc',
      },
      // === 性能优化关键 ===
      // 列表页不需要 Markdown 源码 (content)，只取摘要
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        published: true,
        publishedAt: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        // 关联只查必要字段
        author: {
          select: { id: true, nickname: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        },
      },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      // 详情页需要完整内容
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, nickname: true, profile: { select: { avatar: true, bio: true } } }
        }
      },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const { tagIds, categoryId, published, ...rest } = updatePostDto;

    const data: Prisma.PostUpdateInput = {
      ...rest,
    };

    // 1. 处理状态变更与发布时间
    if (published !== undefined) {
      data.published = published;
      // 逻辑：如果改为“已发布”，设置时间；如果改为“草稿”，清空时间
      data.publishedAt = published ? new Date() : null;
    }

    // 2. 处理分类 (Optional)
    if (categoryId !== undefined) {
      // categoryId 为 null 时解绑，为 string 时绑定
      data.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }

    // 3. 处理标签 (Optional)
    if (tagIds) {
      // set: [...] 会覆盖现有的所有关系，Prisma 自动计算增删
      data.tags = {
        set: tagIds.map((tagId) => ({ id: tagId })),
      };
    }

    try {
      return await this.prisma.post.update({
        where: { id },
        data,
        include: {
          category: true,
          tags: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<Post> {
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * 统一错误处理中心
   */
  private handlePrismaError(error: any): never {
    // P2002: 唯一约束冲突 (Unique constraint)
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes('slug')) {
        throw new ConflictException('文章 Slug 标识已存在，请更换');
      }
      throw new ConflictException('文章数据冲突');
    }

    // P2025: 记录未找到 (Record not found)
    // 可能是文章本身不存在，也可能是关联的分类/标签不存在
    if (error.code === 'P2025') {
      const message = error.meta?.cause || error.message || '';

      // 判断是哪个实体不存在
      if (message.includes('Category')) {
        throw new NotFoundException('所选分类不存在');
      }
      if (message.includes('Tag')) {
        throw new NotFoundException('所选标签不存在');
      }

      // 默认情况：文章不存在
      throw new NotFoundException('文章不存在');
    }

    // P2003: 外键约束失败 (Foreign key constraint failed)
    // 当尝试关联不存在的 Category ID, Tag ID 或 Author ID 时触发
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name as string;

      if (fieldName?.includes('category')) {
        throw new BadRequestException('所选分类不存在');
      }
      if (fieldName?.includes('author')) {
        throw new BadRequestException('指定作者不存在');
      }
      // 对于多对多关系(Tags)，Prisma 报错信息可能略有不同
      throw new BadRequestException('关联的数据(分类或标签)不存在');
    }

    throw error;
  }
}