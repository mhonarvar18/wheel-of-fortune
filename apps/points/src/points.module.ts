import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PointEntry } from './models/point-entry.model';
import { PointBalance } from './models/point-balance.model';
import { PointsMessages } from './points.message';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get('DB_HOST', '127.0.0.1'),
        port: +cfg.get('DB_PORT', '3306'),
        username: cfg.get('DB_USER', 'root'),
        password: cfg.get('DB_PASS', 'root'),
        database: cfg.get('DB_NAME', 'points_db'),
        models: [PointEntry, PointBalance],
        synchronize: true, // فقط dev
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([PointEntry, PointBalance]),
    // اگر لازم داری emit کنی به سرویس‌های دیگر، یک NATS client هم ثبت کن. فعلاً نیاز نداریم.
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: { servers: [process.env.NATS_URL || 'nats://127.0.0.1:4222'] },
      },
    ]),
  ],
  controllers: [PointsController, PointsMessages],
  providers: [PointsService],
})
export class PointsModule {}
