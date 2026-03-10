import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('CryptoService', () => {
  let service: CryptoService;

  const mockConfigService = {
    get: () => 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password and return a different string', async () => {
      const password = 'myPassword123';
      
      const result = await service.hashPassword(password);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(password);
      expect(result.length).toBeGreaterThan(20); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for same password', async () => {
      const password = 'myPassword123';
      
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);
      
      // bcrypt uses salt, so same password produces different hashes
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'myPassword123';
      const hash = await service.hashPassword(password);
      
      const result = await service.comparePassword(password, hash);
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'myPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await service.hashPassword(password);
      
      const result = await service.comparePassword(wrongPassword, hash);
      
      expect(result).toBe(false);
    });
  });
});