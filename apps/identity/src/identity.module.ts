import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET', 'dev'),
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES', '1d') },
      }),
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'mysql',
        host: cfg.get('DB_HOST', 'localhost'),
        port: +cfg.get('DB_PORT', '3306'),
        username: cfg.get('DB_USER', 'root'),
        password: cfg.get('DB_PASS', 'root'),
        database: cfg.get('DB_NAME', 'identity_db'),
        models: [User],
        synchronize: true, // dev only
        autoLoadModels: true,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([User]),
    ClientsModule.registerAsync([
      {
        name: 'POINTS_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.NATS,
          options: { servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')] },
        }),
      },
    ]),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
