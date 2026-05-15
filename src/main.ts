import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Nastolka API')
    .setDescription('Документация бэкенда')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const port = process.env.PORT || 3000;

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // терь error будет чисто стринг
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });

        return new BadRequestException({
          statusCode: 400,
          message: messages.join('; '),
          error: 'Bad Request',
        });
      },
      stopAtFirstError: false,
    }),
  );
  app.use(cookieParser());
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
