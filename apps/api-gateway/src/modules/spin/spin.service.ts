import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@app/common';
import { SpinResult } from 'libs/common/src/types/spin.types';

@Injectable()
export class SpinGatewayService {
  constructor(@Inject('SPIN_CLIENT') private readonly spinClient: ClientProxy) {}

  async execute(userId: string): Promise<SpinResult> {
    const obs$ = this.spinClient.send<SpinResult>(MSG.SPIN_EXECUTE, { userId }).pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }
}
