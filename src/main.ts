import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { static as static_ } from 'express';
import {
  ValidationPipe,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { extraCommonDto } from './common/dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Nastolka API')
    .setDescription('Документация бэкенда')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: extraCommonDto,
  });

  const port = process.env.PORT || 3000;

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Один pipe: transform нужен для query (limit/page как number), иначе @IsInt падает на строках
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const flatten = (
          validationErrors: typeof errors,
          parent?: string,
        ): string[] =>
          validationErrors.flatMap((error) => {
            const path = parent
              ? `${parent}.${error.property}`
              : error.property;
            const own = Object.values(error.constraints || {}).map(
              (message) => `${path}: ${message}`,
            );
            const nested = error.children?.length
              ? flatten(error.children, path)
              : [];

            return [...own, ...nested];
          });

        const messages = flatten(errors);

        return new BadRequestException({
          statusCode: 400,
          message: messages.join('; ') || 'Ошибка валидации',
          error: 'Bad Request',
        });
      },
    }),
  );
  app.use(cookieParser());
  app.use('/uploads', static_('uploads'));
  app.useWebSocketAdapter(new WsAdapter(app));

  app.enableCors({
    origin: 'http://localhost:3000', // FIXME: не забудь в будущем настроить корректные корсы
    credentials: true,
  });
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
