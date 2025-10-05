import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Prize } from './models/prize.model';
import { PrizeHttpController } from './prize.http.controller';
import { PrizeMessages } from './prize.messages';
import { PrizeSeeder } from './seeder/prize.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get('DB_HOST', 'localhost'),
        port: +cfg.get('DB_PORT', '3306'),
        username: cfg.get('DB_USER', 'root'),
        password: cfg.get('DB_PASS', 'root'),
        database: cfg.get('DB_NAME', 'prize_db'),
        models: [Prize],
        synchronize: true, // فقط dev
        autoLoadModels: true,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([Prize]),
  ],
  controllers: [PrizeHttpController, PrizeMessages],
  providers: [PrizeSeeder],
})
export class AppModule {}
