import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, NatsOptions, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common/jwt.strategy';
import { AuthModule } from './modules/auth/auth.module';
import { SpinModule } from 'apps/spin/src/spin.module';
import { PrizeModule } from './modules/prize/prize.module';

const natsClient = (name: string) => ({
  name,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (cfg: ConfigService): NatsOptions => ({
    transport: Transport.NATS,
    options: { servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')] },
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'dev' }),
    ClientsModule.registerAsync([
      natsClient('IDENTITY_CLIENT'),
      natsClient('SPIN_CLIENT'),
      natsClient('PRIZE_CLIENT'),
    ]),
    AuthModule,
    SpinModule,
    PrizeModule,
  ],
  controllers: [ApiGatewayController],
  providers: [JwtStrategy],
})
export class ApiGatewayModule {}
