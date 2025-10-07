import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@app/common';
import type { PointsBalanceResponse, PointsHistoryResponse, PointsApplyDto } from '@app/common';

@Injectable()
export class PointsService {
  constructor(@Inject('POINTS_CLIENT') private readonly client: ClientProxy) {}

  async balance(userId: string): Promise<PointsBalanceResponse> {
    const obs$ = this.client
      .send<PointsBalanceResponse>(MSG.POINTS_BALANCE, { userId })
      .pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }

  async history(userId: string): Promise<PointsHistoryResponse> {
    const obs$ = this.client
      .send<PointsHistoryResponse>(MSG.POINTS_HISTORY, { userId })
      .pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }

  // اختیاری: اگر خواستی از Gateway امتیاز اعمال کنی (مثلاً ادمین)
  async apply(dto: PointsApplyDto): Promise<{ ok: true } | { ok: false; reason: string }> {
    const obs$ = this.client
      .send<{ ok: true } | { ok: false; reason: string }>(MSG.POINTS_APPLY, dto)
      .pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }
}
