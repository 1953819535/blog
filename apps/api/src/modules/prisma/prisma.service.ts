import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@my/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const databaseURL = configService.get<string>('DATABASE_URL');
    if (!databaseURL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    super({
      adapter: new PrismaPg({
        connectionString: databaseURL,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }
}