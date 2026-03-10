import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PostService } from './post.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  const mockPost = {
    id: 'post-uuid-1',
    title: '测试文章',
    slug: 'test-post',
    content: '这是文章内容',
    excerpt: '这是摘要',
    published: true,
    publishedAt: new Date(),
    viewCount: 0,
    authorId: 'user-uuid-1',
    categoryId: 'cat-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'user-uuid-1',
      nickname: '作者',
    },
    category: {
      id: 'cat-uuid-1',
      name: '技术',
      slug: 'tech',
    },
    tags: [
      { id: 'tag-uuid-1', name: 'Vue', slug: 'vue' },
    ],
  };

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const createDto = {
        title: '测试文章',
        slug: 'test-post',
        content: '这是文章内容',
        published: true,
        categoryId: 'cat-uuid-1',
        tagIds: ['tag-uuid-1'],
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.create('user-uuid-1', createDto);

      expect(mockPrismaService.post.create).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it('should set publishedAt when published is true', async () => {
      const createDto = {
        title: '测试文章',
        slug: 'test-post',
        content: '这是文章内容',
        published: true,
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      await service.create('user-uuid-1', createDto);

      const createCall = mockPrismaService.post.create.mock.calls[0][0];
      expect(createCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const createDto = {
        title: '测试文章',
        slug: 'test-post',
        content: '这是文章内容',
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['slug'] },
      };

      mockPrismaService.post.create.mockRejectedValue(prismaError);

      await expect(service.create('user-uuid-1', createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when category does not exist', async () => {
      const createDto = {
        title: '测试文章',
        slug: 'test-post',
        content: '这是文章内容',
        categoryId: 'non-existent',
      };

      const prismaError = {
        code: 'P2003',
        meta: { field_name: 'category' },
      };

      mockPrismaService.post.create.mockRejectedValue(prismaError);

      await expect(service.create('user-uuid-1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return published posts when onlyPublished is true', async () => {
      const mockPosts = [mockPost];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll(true);

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        }),
      );
      expect(result).toEqual(mockPosts);
    });

    it('should return all posts when onlyPublished is false', async () => {
      const mockPosts = [mockPost, { ...mockPost, id: 'post-uuid-2', published: false }];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll(false);

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('should exclude content field in select', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);

      await service.findAll(true);

      const findManyCall = mockPrismaService.post.findMany.mock.calls[0][0];
      expect(findManyCall.select).toBeDefined();
      expect(findManyCall.select.content).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a post by id with full content', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('post-uuid-1');

      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-uuid-1' },
        include: expect.objectContaining({
          category: true,
          tags: true,
        }),
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const updateDto = { title: '新标题' };
      const updatedPost = { ...mockPost, title: '新标题' };

      mockPrismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update('post-uuid-1', updateDto);

      expect(mockPrismaService.post.update).toHaveBeenCalled();
      expect(result.title).toBe('新标题');
    });

    it('should set publishedAt when changing to published', async () => {
      const updateDto = { published: true };

      mockPrismaService.post.update.mockResolvedValue(mockPost);

      await service.update('post-uuid-1', updateDto);

      const updateCall = mockPrismaService.post.update.mock.calls[0][0];
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should clear publishedAt when changing to draft', async () => {
      const updateDto = { published: false };

      mockPrismaService.post.update.mockResolvedValue(mockPost);

      await service.update('post-uuid-1', updateDto);

      const updateCall = mockPrismaService.post.update.mock.calls[0][0];
      expect(updateCall.data.publishedAt).toBeNull();
    });

    it('should disconnect category when categoryId is null', async () => {
      const updateDto = { categoryId: null as unknown as string };

      mockPrismaService.post.update.mockResolvedValue(mockPost);

      await service.update('post-uuid-1', updateDto);

      const updateCall = mockPrismaService.post.update.mock.calls[0][0];
      expect(updateCall.data.category.disconnect).toBe(true);
    });

    it('should throw NotFoundException when post not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.post.update.mockRejectedValue(prismaError);

      await expect(service.update('non-existent', { title: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove('post-uuid-1');

      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: 'post-uuid-1' },
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.post.delete.mockRejectedValue(prismaError);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});