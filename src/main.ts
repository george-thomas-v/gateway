import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swagger } from './libs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  swagger.setup(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 6000);
}
bootstrap();
