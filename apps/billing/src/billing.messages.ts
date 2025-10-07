import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { Purchase } from './models/purchase.model';
import { MSG } from '@app/common';
import type {
  PurchaseCreateDto,
  PurchaseCreateResponse,
  PurchaseStatusResponse,
} from '@app/common';
import { UniqueConstraintError } from 'sequelize';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller()
export class BillingMessages {
  constructor(
    @InjectModel(Purchase) private readonly purchases: typeof Purchase,
    @Inject('NATS_BILLING') private readonly nats: ClientProxy, // برای emit رویداد paid
  ) {}

  @MessagePattern(MSG.BILLING_PURCHASE_CREATE)
  async create(dto: PurchaseCreateDto): Promise<PurchaseCreateResponse> {
    try {
      // idempotent با externalId
      const [row] = await this.purchases.findOrCreate({
        where: { externalId: dto.externalId },
        defaults: {
          userId: dto.userId,
          itemId: dto.itemId,
          amount: dto.amount,
          currency: dto.currency,
          status: 'pending',
          externalId: dto.externalId,
          meta: dto.meta ?? null,
        },
      });

      // در MVP می‌تونیم شبیه‌سازی کنیم که پرداخت بلافاصله موفق می‌شه
      // در عمل: اینجا paymentUrl/intent می‌سازی و webhook بعدا status را 'paid' می‌کند
      // شبیه‌سازی پرداخت موفق:
      if (row.status === 'pending') {
        await row.update({ status: 'paid', paymentRef: `SIM-${row.id}` });
        // emit event → points
        this.nats.emit(MSG.BILLING_PURCHASE_PAID, {
          purchaseId: row.id,
          userId: row.userId,
          amount: row.amount,
          currency: row.currency,
          itemId: row.itemId,
          at: new Date().toISOString(),
        });
      }

      return { ok: true, purchaseId: row.id, paymentUrl: null };
    } catch (err: unknown) {
      const reason =
        err instanceof UniqueConstraintError
          ? 'DUPLICATE'
          : err instanceof Error
            ? err.message
            : 'ERROR';
      return { ok: false, reason };
    }
  }

  @MessagePattern(MSG.BILLING_PURCHASE_STATUS)
  async status(payload: { purchaseId: string }): Promise<PurchaseStatusResponse> {
    const row = await this.purchases.findByPk(payload.purchaseId, { raw: true });
    if (!row) return { ok: false, reason: 'NOT_FOUND' };
    return { ok: true, status: row.status, purchaseId: row.id };
  }
}
