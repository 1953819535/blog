import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter, LocalOnlyGuard, RequestIdMiddleware, TransformInterceptor } from './common/index.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loggerConfig } from './common/config/logger.config.js';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { VerificationModule } from './modules/verification/verification.module.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，其他模块无需再次导入
      envFilePath: '.env', // 指定文件路径，默认就是 .env
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: loggerConfig,
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    VerificationModule,
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
