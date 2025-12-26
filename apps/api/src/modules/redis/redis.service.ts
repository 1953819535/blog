import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    // 使用 Upstash Redis URL
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    this.client = new Redis(redisUrl);

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }

  /**
   * 获取 Redis 客户端实例
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: string | number | object, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (ttl) {
      await this.client.setex(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  /**
   * 获取缓存
   */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 批量删除(支持模式匹配)
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * Hash 操作 - 设置
   */
  async hset(key: string, field: string, value: string | number | object): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await this.client.hset(key, field, stringValue);
  }

  /**
   * Hash 操作 - 获取
   */
  async hget<T = string>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Hash 操作 - 获取所有
   */
  async hgetall<T = Record<string, string>>(key: string): Promise<T | null> {
    const value = await this.client.hgetall(key);
    if (!value || Object.keys(value).length === 0) return null;
    return value as T;
  }

  /**
   * Hash 操作 - 删除字段
   */
  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(key, ...fields);
  }

  /**
   * 列表操作 - 左侧推入
   */
  async lpush(key: string, ...values: string[]): Promise<void> {
    await this.client.lpush(key, ...values);
  }

  /**
   * 列表操作 - 右侧推入
   */
  async rpush(key: string, ...values: string[]): Promise<void> {
    await this.client.rpush(key, ...values);
  }

  /**
   * 列表操作 - 获取范围
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  /**
   * 集合操作 - 添加成员
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  /**
   * 集合操作 - 获取所有成员
   */
  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  /**
   * 有序集合操作 - 添加成员
   */
  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  /**
   * 有序集合操作 - 获取范围(按分数)
   */
  async zrangebyscore(key: string, min: number | string, max: number | string): Promise<string[]> {
    return await this.client.zrangebyscore(key, min, max);
  }

  /**
   * 自增
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * 自减
   */
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  /**
   * 模块销毁时关闭连接
   */
  async onModuleDestroy() {
    await this.client.quit();
    console.log('🔌 Redis connection closed');
  }
}
