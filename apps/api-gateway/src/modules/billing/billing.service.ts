import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@app/common';
import type {
  PurchaseCreateDto,
  PurchaseCreateResponse,
  PurchaseStatusResponse,
} from '@app/common';

@Injectable()
export class BillingService {
  constructor(@Inject('BILLING_CLIENT') private readonly client: ClientProxy) {}

  async create(dto: PurchaseCreateDto): Promise<PurchaseCreateResponse> {
    return await firstValueFrom(
      this.client
        .send<PurchaseCreateResponse>(MSG.BILLING_PURCHASE_CREATE, dto)
        .pipe(timeout(3000)),
    );
  }

  async status(purchaseId: string): Promise<PurchaseStatusResponse> {
    return await firstValueFrom(
      this.client
        .send<PurchaseStatusResponse>(MSG.BILLING_PURCHASE_STATUS, { purchaseId })
        .pipe(timeout(3000)),
    );
  }
}
