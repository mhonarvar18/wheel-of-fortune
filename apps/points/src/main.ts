import { NestFactory } from '@nestjs/core';
import { PointsModule } from './points.module';

async function bootstrap() {
  const app = await NestFactory.create(PointsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
