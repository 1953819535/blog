import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1DAY' },
    }),
  ],
  providers: [AuthService, RedisService, EmailService, UsersService],
  controllers: [AuthController],
})
export class AuthModule { }