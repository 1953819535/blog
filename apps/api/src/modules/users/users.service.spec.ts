import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CryptoService } from '../crypto/crypto.service.js';
import { R2Service } from '../r2/r2.service.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: () => null,
      create: () => null,
      update: () => null,
    },
    profile: {
      create: () => null,
      update: () => null,
    },
    userRole: {
      create: () => null,
    },
    role: {
      findFirst: () => null,
    },
  };

  const mockCryptoService = {
    hashPassword: () => 'hashed-password',
    comparePassword: () => true,
  };

  const mockR2Service = {
    getPresignedUrl: () => 'https://example.com/presigned-url',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: R2Service,
          useValue: mockR2Service,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});