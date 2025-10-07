import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { PointEntry } from '../../points/src/models/point-entry.model';
import { PointBalance } from '../../points/src/models/point-balance.model';

import type { Transaction } from 'sequelize';
import { UniqueConstraintError } from 'sequelize';

import { REASONS, MSG } from '@app/common'; // مقدارها از پکیج
import type {
  PointsReason,
  PointsApplyDto,
  PointsBalanceResponse,
  PointsEntry,
  PointsHistoryResponse,
} from '@app/common';

@Controller()
export class PointsMessages {
  constructor(
    @InjectModel(PointEntry) private readonly entries: typeof PointEntry,
    @InjectModel(PointBalance) private readonly balances: typeof PointBalance,
  ) {}

  private readonly reasonSet = new Set<string>(REASONS as readonly string[]);

  private toPointsReason(s: string): PointsReason {
    return this.reasonSet.has(s) ? (s as PointsReason) : 'signup';
  }

  private async ensureBalance(userId: string, tx?: Transaction) {
    await this.balances.findOrCreate({
      where: { userId },
      defaults: { userId, balance: 0, updatedAt: new Date() },
      transaction: tx,
    });
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
      const m = (err as Record<string, unknown>).message;
      return typeof m === 'string' ? m : 'ERROR';
    }
    return 'ERROR';
  }

  @MessagePattern(MSG.POINTS_APPLY)
  async apply(dto: PointsApplyDto): Promise<{ ok: true } | { ok: false; reason: string }> {
    const sequelize = this.entries.sequelize!;
    const tx = await sequelize.transaction();
    try {
      const dup = await this.entries.count({
        where: { externalId: dto.externalId },
        transaction: tx,
      });
      if (dup > 0) {
        await tx.commit();
        return { ok: true };
      }

      await this.ensureBalance(dto.userId, tx);

      await this.entries.create(
        {
          userId: dto.userId,
          delta: dto.delta,
          reason: dto.reason,
          externalId: dto.externalId,
          meta: dto.meta ?? null,
        },
        { transaction: tx },
      );

      await this.balances.increment(
        { balance: dto.delta },
        { where: { userId: dto.userId }, transaction: tx },
      );
      await this.balances.update(
        { updatedAt: new Date() },
        { where: { userId: dto.userId }, transaction: tx },
      );

      await tx.commit();
      return { ok: true };
    } catch (err: unknown) {
      await tx.rollback();
      if (err instanceof UniqueConstraintError) return { ok: true };
      return { ok: false, reason: this.getErrorMessage(err) };
    }
  }

  @MessagePattern(MSG.POINTS_BALANCE)
  async balance(payload: { userId: string }): Promise<PointsBalanceResponse> {
    const row = await this.balances.findByPk(payload.userId, { raw: true });
    return {
      userId: payload.userId,
      balance: row?.balance ?? 0,
      updatedAt: (row?.updatedAt ?? new Date()).toISOString(),
    };
  }

  @MessagePattern(MSG.POINTS_HISTORY)
  async history(payload: { userId: string }): Promise<PointsHistoryResponse> {
    type RawRow = {
      id: string;
      userId: string;
      delta: number;
      reason: string;
      externalId: string;
      meta: unknown;
      createdAt: Date;
    };

    const rows = await this.entries.findAll({
      where: { userId: payload.userId },
      attributes: ['id', 'userId', 'delta', 'reason', 'externalId', 'meta', 'createdAt'],
      order: [['createdAt', 'DESC']],
      raw: true,
      limit: 200,
    });

    const typedRows = rows as unknown as RawRow[]; // ⬅️ جنریک حذف شد، یک‌بار cast به unknown
    const items: PointsEntry[] = typedRows.map((r) => {
      let meta: Record<string, unknown> | null = null;

      if (r.meta != null) {
        if (typeof r.meta === 'string') {
          // ⬅️ بدون any: خروجی parse را اول unknown بگیر
          const parsed: unknown = JSON.parse(r.meta);
          meta = this.isRecord(parsed) ? parsed : null;
        } else if (this.isRecord(r.meta)) {
          meta = r.meta;
        } else {
          meta = null;
        }
      }

      return {
        id: r.id,
        userId: r.userId,
        delta: r.delta,
        reason: this.toPointsReason(r.reason),
        externalId: r.externalId,
        meta,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return { items };
  }

  @EventPattern(MSG.BILLING_PURCHASE_PAID)
  async onPurchasePaid(evt: {
    purchaseId: string;
    userId: string;
    amount: number;
    currency: string;
    itemId: string;
    at: string;
  }) {
    const delta = evt.amount >= 1_000_000 ? 5 : evt.amount >= 500_000 ? 3 : 1;
    await this.apply({
      userId: evt.userId,
      delta,
      reason: 'purchase',
      externalId: `purchase:${evt.purchaseId}`,
      meta: { amount: evt.amount, currency: evt.currency, itemId: evt.itemId, at: evt.at },
    });
  }

  isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  @EventPattern(MSG.REFERRAL_SIGNUP)
  async onReferral(evt: { referrerId: string; refereeId: string; at: string }) {
    await this.apply({
      userId: evt.referrerId,
      delta: +1,
      reason: 'referral_referrer',
      externalId: `referral:referrer:${evt.refereeId}`,
      meta: { at: evt.at },
    });
    await this.apply({
      userId: evt.refereeId,
      delta: +1,
      reason: 'referral_referee',
      externalId: `referral:referee:${evt.refereeId}`,
      meta: { at: evt.at },
    });
  }
}
