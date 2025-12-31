import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './common/index.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Redis 示例接口 - 设置缓存
   * POST /cache { "key": "test", "value": "hello", "ttl": 60 }
   */
  @Post('cache')
  async setCache(
    @Body() body: { key: string; value: any; ttl?: number },
  ): Promise<{ message: string }> {
    await this.appService.setCache(body.key, body.value, body.ttl);
    return { message: 'Cache set successfully' };
  }

  /**
   * Redis 示例接口 - 获取缓存
   * GET /cache/:key
   */
  @Get('cache/:key')
  async getCache(@Param('key') key: string): Promise<any> {
    const value = await this.appService.getCache(key);
    return { key, value };
  }

  /**
   * Redis 示例接口 - 访问计数
   * GET /visit
   */
  @Get('visit')
  async visit(): Promise<{ count: number }> {
    const count = await this.appService.incrementVisitCount();
    return { count };
  }

  /**
   * Redis 示例接口 - 获取访问计数
   * GET /visit/count
   */
  @Get('visit/count')
  async getVisitCount(): Promise<{ count: number }> {
    const count = await this.appService.getVisitCount();
    return { count };
  }
}
