import {
  Injectable,
  ConflictException,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category, Prisma } from '@my/prisma'; // 引入 Prisma 命名空间以获取错误类型

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * 统一处理 Prisma 错误
   * 将数据库错误转换为友好的 HTTP 异常
   */
  private handlePrismaError(error: any): never {
    // P2002: Unique constraint failed (唯一约束冲突)
    if (error.code === 'P2002') {
      const target = error.meta?.target;

      // Prisma 通常返回数组，如 ['name'] 或 ['slug']
      if (Array.isArray(target)) {
        if (target.includes('name')) {
          throw new ConflictException('分类名称已存在');
        }
        if (target.includes('slug')) {
          throw new ConflictException('分类标识已存在');
        }
      }
      // 兜底冲突错误
      throw new ConflictException('分类数据已存在');
    }

    // P2025: Record to update not found (记录未找到)
    if (error.code === 'P2025') {
      throw new NotFoundException('分类不存在');
    }

    // 其他未知错误直接抛出
    throw error;
  }
}