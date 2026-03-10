import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockCategory = {
    id: 'uuid-1',
    name: '技术',
    slug: 'tech',
    description: '技术相关文章',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    category: {
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
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createDto = {
        name: '技术',
        slug: 'tech',
        description: '技术相关文章',
      };

      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException when name already exists', async () => {
      const createDto = {
        name: '技术',
        slug: 'tech-new',
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['name'] },
      };

      mockPrismaService.category.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const createDto = {
        name: '新技术',
        slug: 'tech',
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['slug'] },
      };

      mockPrismaService.category.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [mockCategory];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('uuid-1');

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateDto = { name: '新名称' };
      const updatedCategory = { ...mockCategory, name: '新名称' };

      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('uuid-1', updateDto);

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.category.update.mockRejectedValue(prismaError);

      await expect(service.update('non-existent', { name: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a category successfully', async () => {
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove('uuid-1');

      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.category.delete.mockRejectedValue(prismaError);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});