import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service.js';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: (key: string) => {
      if (key === 'RESEND_API_KEY') return 'test-api-key';
      if (key === 'MAIL_FROM_ADDRESS') return 'test@example.com';
      return null;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});