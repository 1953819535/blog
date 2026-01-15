import { 
  Injectable, 
  ConflictException, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { Tag } from '@my/prisma';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    try {
      return await this.prisma.tag.create({
        data: createTagDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      // 修正：模型没有 createdAt，建议按名称 A-Z 排序，方便前端展示
      orderBy: {
        name: 'asc', 
      },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<Tag> {
    try {
      return await this.prisma.tag.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * 统一处理 Prisma 错误
   */
  private handlePrismaError(error: any): never {
    // P2002: 唯一约束冲突 (Unique constraint failed)
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      
      if (Array.isArray(target)) {
        if (target.includes('name')) {
          throw new ConflictException('标签名称已存在');
        }
        if (target.includes('slug')) {
          throw new ConflictException('标签标识已存在');
        }
      }
      throw new ConflictException('标签数据已存在');
    }

    // P2025: 记录未找到 (Record not found)
    if (error.code === 'P2025') {
      throw new NotFoundException('标签不存在');
    }

    throw error;
  }
}