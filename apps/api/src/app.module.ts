import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter, LocalOnlyGuard, AuthGuard, RequestIdMiddleware, TransformInterceptor } from './common/index.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loggerConfig } from './common/config/logger.config.js';
import { validateEnv } from './common/config/env.validation.js';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { R2Module } from './modules/r2/r2.module.js';
import { CryptoModule } from './modules/crypto/crypto.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，其他模块无需再次导入
      envFilePath: '.env', // 指定文件路径，默认就是 .env
      validate: validateEnv, // 启动时验证环境变量
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: loggerConfig,
      inject: [ConfigService],
    }),
    CryptoModule, // 添加 CryptoModule 导入
    PrismaModule,
    RedisModule,
    EmailModule,
    R2Module,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    // 本地访问守卫
    {
      provide: APP_GUARD,
      useClass: LocalOnlyGuard,
    },
    // 全局验证管道 - 使用自定义 ValidationPipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // 全局响应转换拦截器 - 统一包装成功响应
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 全局异常过滤器 - 统一处理异常响应
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局身份验证守卫
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用 RequestIdMiddleware - 必须在最前面，为所有请求生成 ID
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    // Pino 会自动记录所有 HTTP 请求日志，无需 LoggerMiddleware
  }
}
