import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.enableCors({ credentials: true, origin: true });
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.use(
    '/thumbnails',
    express.static(join(__dirname, '..', 'uploads', 'thumbnails')),
  );

  const config = new DocumentBuilder()
    .setTitle('cloud storage')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(7777);
}
bootstrap();
