import { Module, OnModuleDestroy, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SpinService } from './spin.service';
import { Spin } from './models/spin.model';
import { AwardedPrize } from './models/awarded-prize.model';
import IORedis, { Redis } from 'ioredis';
import { SpinMessages } from './spin.messages';

export const REDIS_TOKEN = 'REDIS';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get('DB_HOST', '127.0.0.1'), // ✅ IPv4 صریح برای macOS
        port: +cfg.get('DB_PORT', '3306'),
        username: cfg.get('DB_USER', 'root'),
        password: cfg.get('DB_PASS', 'root'),
        database: cfg.get('DB_NAME', 'spin_db'),
        models: [Spin, AwardedPrize],
        synchronize: true,
        autoLoadModels: true,
        logging: false,
        pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
      }),
    }),
    SequelizeModule.forFeature([Spin, AwardedPrize]),
    ClientsModule.registerAsync([
      {
        name: 'PRIZE_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')], // ✅ IPv4
            reconnect: true, // ✅ پایداری اتصال NATS
            maxReconnectAttempts: -1,
            tls: false,
            noRandomize: true,
            pingInterval: 5000,
            timeout: 2000,
          },
        }),
      },
    ]),
  ],
  controllers: [SpinMessages],
  providers: [
    SpinService,
    {
      provide: REDIS_TOKEN,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): Redis => {
        const url = cfg.get<string>('REDIS_URL', 'redis://127.0.0.1:6379'); // ✅ IPv4
        console.log('[Redis] connecting to', url);

        const client = new IORedis(url, {
          lazyConnect: false,
          family: 4, // ✅ جلوگیری از ECONNRESET در macOS
          maxRetriesPerRequest: 1,
          enableReadyCheck: true,
          retryStrategy: (times) => Math.min(times * 200, 1000),
          reconnectOnError: (err) => {
            console.error('[Redis reconnect]', err.message);
            return true;
          },
        });

        client.on('connect', () => console.log('[Redis] connected ✅'));
        client.on('ready', () => console.log('[Redis] ready'));
        client.on('end', () => console.warn('[Redis] connection ended'));
        client.on('reconnecting', () => console.log('[Redis] reconnecting...'));
        client.on('error', (e) => console.error('[Redis error]', e.message));

        return client;
      },
    },
  ],
})
export class SpinModule implements OnModuleDestroy, OnModuleInit {
  constructor(@Inject(REDIS_TOKEN) private readonly redis: Redis) {}

  async onModuleInit() {
    // 🚀 تست اتصال اولیه MySQL + Redis + NATS
    console.log('[SpinModule] Initializing connections...');
    try {
      await this.redis.ping();
      console.log('[Redis] ping success');
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('[Redis] ping failed ❌', e.message);
      } else {
        console.error('[Redis] ping failed ❌', String(e));
      }
    }
  }

  async onModuleDestroy() {
    console.log('[SpinModule] shutting down...');
    try {
      await this.redis.quit();
      console.log('[Redis] disconnected gracefully');
    } catch {
      /* ignore */
    }
  }
}
