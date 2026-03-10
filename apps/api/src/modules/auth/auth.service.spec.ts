import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { EmailService } from '../email/email.service.js';
import { RedisService } from '../redis/redis.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: () => null,
    create: () => null,
    findById: () => null,
  };

  const mockEmailService = {
    sendVerificationCode: () => null,
  };

  const mockRedisService = {
    get: () => null,
    set: () => null,
    del: () => null,
  };

  const mockJwtService = {
    signAsync: () => 'mock-jwt-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});