import { ConfigService } from '@nestjs/config';
import { Transport, NatsOptions } from '@nestjs/microservices';

export const createNatsClient = (name: string) => ({
  name,
  imports: [],
  inject: [ConfigService],
  useFactory: (cfg: ConfigService): NatsOptions => ({
    transport: Transport.NATS,
    options: {
      servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')],
    },
  }),
});
