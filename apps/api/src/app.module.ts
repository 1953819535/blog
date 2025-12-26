import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { RedisModule } from './modules/redis/redis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，其他模块无需再次导入
      envFilePath: '.env', // 指定文件路径，默认就是 .env
    }),
    PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
