import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../email/email.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, RedisService, EmailService, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}