import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export function setupSwagger(app: INestApplication, port: number) {
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('A simple blog API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs-api', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.use(
    '/reference',
    apiReference({
      url: '/swagger/json',
      theme: 'default',
      layout: 'modern',
    }),
  );

  // 这里我们改变文档地址，使用 scalar 来展示 API 文档
  console.log(`docs start on http://localhost:${port}/reference`);
}