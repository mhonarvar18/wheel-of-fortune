import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BillingMessages } from './billing.messages';
import { Purchase } from './models/purchase.model';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get('BILLING_DB_HOST', '127.0.0.1'),
        port: +cfg.get('BILLING_DB_PORT', '3306'),
        username: cfg.get('BILLING_DB_USER', 'root'),
        password: cfg.get('BILLING_DB_PASS', 'root'),
        database: cfg.get('BILLING_DB_NAME', 'billing_db'),
        // نکته: یکی از این دو روش اوکیه؛ من هر دو رو گذاشتم که مطمئن باشیم
        models: [Purchase],
        autoLoadModels: true,
        synchronize: true,
        sync: { alter: true },
        logging: console.log, // موقتاً روشن باشه تا CREATE TABLE را ببینی
      }),
    }),
    SequelizeModule.forFeature([Purchase]),
    ClientsModule.registerAsync([
      {
        name: 'NATS_BILLING',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.NATS,
          options: { servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')] },
        }),
      },
    ]),
  ],
  controllers: [BillingMessages],
})
export class BillingModule {}
