import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RapidocModule } from '@b8n/nestjs-rapidoc';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  setupDocs(app);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


async function setupDocs(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle(process.env.DOC_TITLE ?? 'API')
    .setDescription(process.env.DOC_DESCRIPTION ?? 'API Documentation')
    .setVersion(process.env.DOC_VERSION ?? '1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  RapidocModule.setup('api', app as any, document);
  SwaggerModule.setup('swagger', app, document);
}
