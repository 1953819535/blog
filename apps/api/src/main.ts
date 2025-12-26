import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './setup-swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  setupSwagger(app, port);

  await app.listen(port ?? 3010);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
