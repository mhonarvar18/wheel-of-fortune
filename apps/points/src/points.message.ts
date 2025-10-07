import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { PointEntry } from './models/point-entry.model';
import { PointBalance } from './models/point-balance.model';

import { Transaction } from 'sequelize';
import { UniqueConstraintError } from 'sequelize';

import { REASONS, MSG } from '@app/common'; // مقدارها از پکیج
import type {
  PointsReason,
  PointsApplyDto,
  PointsBalanceResponse,
  PointsEntry,
  PointsHistoryResponse,
  PointsChargeDto,
  PointsOpResp,
  PointsRefundDto,
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
    // Rule #1: ≥ 100k => +1
    if (evt.amount >= 100_000 && evt.amount < 200_000) {
      await this.apply({
        userId: evt.userId,
        delta: +1,
        reason: 'purchase',
        externalId: `purchase:${evt.purchaseId}:100k`, // ایدمپوتنت جدا
        meta: { amount: evt.amount, currency: evt.currency, itemId: evt.itemId, at: evt.at },
      });
    }

    // Rule #2: ≥ 200k => +2
    if (evt.amount >= 200_000) {
      await this.apply({
        userId: evt.userId,
        delta: +2,
        reason: 'purchase',
        externalId: `purchase:${evt.purchaseId}:200k`, // ایدمپوتنت جدا
        meta: { amount: evt.amount, currency: evt.currency, itemId: evt.itemId, at: evt.at },
      });
    }
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

  @MessagePattern(MSG.POINTS_CHARGE)
  async charge(dto: PointsChargeDto): Promise<PointsOpResp> {
    const sequelize = this.entries.sequelize!;
    const tx = await sequelize.transaction();
    try {
      // ایدمپوتنت: اگر قبلاً همین externalId ثبت شده، OK
      const dup = await this.entries.count({
        where: { externalId: dto.externalId },
        transaction: tx,
      });
      if (dup > 0) {
        const bal = await this.balances.findByPk(dto.userId, { transaction: tx });
        await tx.commit();
        return { ok: true, balance: bal?.balance ?? 0 };
      }

      await this.ensureBalance(dto.userId, tx);

      // قفل ردیف بالانس برای جلوگیری از ریس
      const bal = await this.balances.findByPk(dto.userId, {
        transaction: tx,
        lock: Transaction.LOCK.UPDATE,
      });

      if (!bal || bal.balance < dto.amount) {
        await tx.rollback();
        return { ok: false, reason: 'INSUFFICIENT' };
      }

      await this.entries.create(
        {
          userId: dto.userId,
          delta: -dto.amount, // کم‌کردن
          reason: 'spin_cost', // یا reason جدا مثل 'spin_cost'؛ دلخواه
          externalId: dto.externalId,
          meta: dto.meta ?? null,
        },
        { transaction: tx },
      );

      await this.balances.decrement(
        { balance: dto.amount },
        { where: { userId: dto.userId }, transaction: tx },
      );
      await this.balances.update(
        { updatedAt: new Date() },
        { where: { userId: dto.userId }, transaction: tx },
      );

      const newBal = await this.balances.findByPk(dto.userId, { transaction: tx });
      await tx.commit();
      return { ok: true, balance: newBal?.balance ?? 0 };
    } catch (err) {
      await tx.rollback();
      if (err instanceof UniqueConstraintError) return { ok: true, balance: 0 };
      return { ok: false, reason: 'ERROR' };
    }
  }

  @MessagePattern(MSG.POINTS_REFUND)
  async refund(dto: PointsRefundDto): Promise<PointsOpResp> {
    const sequelize = this.entries.sequelize!;
    const tx = await sequelize.transaction();
    try {
      const dup = await this.entries.count({
        where: { externalId: dto.externalId },
        transaction: tx,
      });
      if (dup > 0) {
        const bal = await this.balances.findByPk(dto.userId, { transaction: tx });
        await tx.commit();
        return { ok: true, balance: bal?.balance ?? 0 };
      }

      await this.ensureBalance(dto.userId, tx);

      await this.entries.create(
        {
          userId: dto.userId,
          delta: +dto.amount, // برگرداندن
          reason: 'spin_refund', // یا 'spin_refund'؛ دلخواه
          externalId: dto.externalId,
          meta: dto.meta ?? null,
        },
        { transaction: tx },
      );

      await this.balances.increment(
        { balance: dto.amount },
        { where: { userId: dto.userId }, transaction: tx },
      );
      await this.balances.update(
        { updatedAt: new Date() },
        { where: { userId: dto.userId }, transaction: tx },
      );

      const newBal = await this.balances.findByPk(dto.userId, { transaction: tx });
      await tx.commit();
      return { ok: true, balance: newBal?.balance ?? 0 };
    } catch (err) {
      await tx.rollback();
      if (err instanceof UniqueConstraintError) return { ok: true, balance: 0 };
      return { ok: false, reason: 'ERROR' };
    }
  }
}
