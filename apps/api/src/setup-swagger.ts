import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export function setupSwagger(app: INestApplication, port: number) {
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('A simple blog API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
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
      authentication: {
        preferredSecurityScheme: 'JWT-auth',
      },
    }),
  );

  console.log(`docs start on http://localhost:${port}/reference`);
}