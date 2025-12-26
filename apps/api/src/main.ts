import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port ?? 3010);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
