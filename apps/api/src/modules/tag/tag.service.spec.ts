import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TagService } from './tag.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockTag = {
    id: 'uuid-1',
    name: 'Vue',
    slug: 'vue',
  };

  const mockPrismaService = {
    tag: {
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
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tag successfully', async () => {
      const createDto = {
        name: 'Vue',
        slug: 'vue',
      };

      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(createDto);

      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException when name already exists', async () => {
      const createDto = {
        name: 'Vue',
        slug: 'vue-new',
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['name'] },
      };

      mockPrismaService.tag.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const createDto = {
        name: 'Vue3',
        slug: 'vue',
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['slug'] },
      };

      mockPrismaService.tag.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of tags sorted by name', async () => {
      const mockTags = [
        { id: '1', name: 'JavaScript', slug: 'javascript' },
        { id: '2', name: 'Vue', slug: 'vue' },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('uuid-1');

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tag successfully', async () => {
      const updateDto = { name: 'Vue 3' };
      const updatedTag = { ...mockTag, name: 'Vue 3' };

      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update('uuid-1', updateDto);

      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.tag.update.mockRejectedValue(prismaError);

      await expect(service.update('non-existent', { name: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a tag successfully', async () => {
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove('uuid-1');

      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      const prismaError = {
        code: 'P2025',
      };

      mockPrismaService.tag.delete.mockRejectedValue(prismaError);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});