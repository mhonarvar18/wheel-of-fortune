import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { SpinController } from './spin.controller';
import { SpinGatewayService } from './spin.service';
import { createNatsClient } from '../../shared/nats-client.factory';

@Module({
  imports: [ConfigModule, ClientsModule.registerAsync([createNatsClient('SPIN_CLIENT')])],
  controllers: [SpinController],
  providers: [SpinGatewayService],
  exports: [SpinGatewayService],
})
export class SpinModule {}
