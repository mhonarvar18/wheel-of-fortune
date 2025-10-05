import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@app/common'; // ✅ از libs/common/nats/messages استفاده می‌کنیم
import { PrizeListResponse } from 'libs/common/src/types/prize.types';

@Injectable()
export class PrizeService {
  constructor(@Inject('PRIZE_CLIENT') private readonly prizeClient: ClientProxy) {}

  async list() {
    const obs$ = this.prizeClient.send<PrizeListResponse>(MSG.PRIZE_LIST, {}).pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }
}
