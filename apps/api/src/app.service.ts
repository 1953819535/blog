import { Injectable } from '@nestjs/common';
import { RedisService } from './modules/redis/redis.service.js';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Redis 使用示例 - 设置和获取缓存
   */
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    await this.redisService.set(key, value, ttl);
  }

  async getCache<T = any>(key: string): Promise<T | null> {
    return await this.redisService.get<T>(key);
  }

  /**
   * Redis 使用示例 - 访问计数器
   */
  async incrementVisitCount(): Promise<number> {
    return await this.redisService.incr('visit:count');
  }

  async getVisitCount(): Promise<number> {
    const count = await this.redisService.get<string>('visit:count');
    return count ? parseInt(count) : 0;
  }
}
