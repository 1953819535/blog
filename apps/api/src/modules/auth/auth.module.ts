import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';
import { UsersService } from '../users/users.service.js';

@Module({
  providers: [AuthService, RedisService, EmailService, UsersService],
  controllers: [AuthController],
})
export class AuthModule { }