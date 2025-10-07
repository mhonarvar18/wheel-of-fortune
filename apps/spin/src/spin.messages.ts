import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { MSG, PointsOpResp, type WeightedPrize } from '@app/common';
import { Spin } from './models/spin.model';
import { AwardedPrize } from './models/awarded-prize.model';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Redis } from 'ioredis';
import { lastValueFrom, timeout } from 'rxjs';

@Controller()
export class SpinMessages {
  constructor(
    @Inject('PRIZE_CLIENT') private readonly prizeClient: ClientProxy,
    @Inject('POINTS_CLIENT') private readonly pointsClient: ClientProxy,
    @InjectModel(Spin) private readonly spinModel: typeof Spin,
    @InjectModel(AwardedPrize) private readonly awardedModel: typeof AwardedPrize,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  @MessagePattern(MSG.SPIN_EXECUTE)
  async execute(payload: { userId: string }) {
    const userId = payload.userId;

    const lockKey = `spin:lock:${userId}`;
    const lockedRes = await this.redis.set(lockKey, '1', 'PX', 3000, 'NX'); // Promise<'OK' | null>
    const locked = lockedRes === 'OK';
    if (!locked) return { error: 'SPIN_IN_PROGRESS' };

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      // 1) Charge
      const charge = await lastValueFrom(
        this.pointsClient
          .send<PointsOpResp>(MSG.POINTS_CHARGE, {
            userId,
            amount: 1,
            externalId: `spin:${requestId}`, // ایدمپوتنت
          })
          .pipe(timeout(2000)),
      );
      if (!charge.ok) return { error: 'INSUFFICIENT_POINTS' };

      const allPrizes = await lastValueFrom(
        this.prizeClient.send<WeightedPrize[]>(MSG.PRIZE_AVAILABLE, { userId }).pipe(timeout(3000)),
      );
      if (!allPrizes?.length) return { error: 'NO_PRIZE_AVAILABLE' };

      const awarded = (await this.awardedModel.findAll({
        where: { userId },
        attributes: ['prizeId'],
        raw: true,
      })) as { prizeId: string }[];
      const set = new Set(awarded.map((a) => a.prizeId));
      const available = allPrizes.filter((p) => !(p.oneTimePerUser && set.has(p.id)));
      if (!available.length) return { error: 'NO_PRIZE_AVAILABLE_FOR_USER' };

      const chosen = weightedPick(available);

      const tx = await this.spinModel.sequelize!.transaction();
      try {
        await this.spinModel.create(
          { userId, prizeId: chosen.id, resultMeta: { prizeName: chosen.name, type: chosen.type } },
          { transaction: tx },
        );
        if (chosen.oneTimePerUser) {
          await this.awardedModel.create({ userId, prizeId: chosen.id }, { transaction: tx });
        }
        await tx.commit();
        this.prizeClient.emit(MSG.PRIZE_AWARDED, {
          userId,
          prizeId: chosen.id,
          prizeName: chosen.name,
          type: chosen.type,
          at: new Date().toISOString(),
        });
      } catch (e: any) {
        await tx.rollback();

        await lastValueFrom(
          this.pointsClient
            .send<PointsOpResp>(MSG.POINTS_REFUND, {
              userId,
              amount: 1,
              externalId: `refund:${requestId}`,
            })
            .pipe(timeout(2000)),
        );
        if (isSequelizeUniqueError(e)) {
          return { error: 'ALREADY_AWARDED', prizeId: chosen.id };
        }
        throw new Error(errMessage(e));
      }

      return { userId, prizeId: chosen.id, prizeName: chosen.name, type: chosen.type };
    } finally {
      await this.redis.del(lockKey);
    }
  }
}

function isSequelizeUniqueError(err: unknown): err is { name: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: unknown }).name === 'SequelizeUniqueConstraintError'
  );
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as Record<string, unknown>).message;
    return typeof m === 'string' ? m : 'ERROR';
  }
  return 'ERROR';
}

function weightedPick(prizes: WeightedPrize[]) {
  if (prizes.length === 0) {
    throw new Error('weightedPick: empty prize list');
  }

  // مجموع وزن‌ها (فقط وزن‌های مثبت)
  const totalWeight = prizes.reduce((acc, prize) => acc + Math.max(0, prize.weight), 0);

  // اگر تمام وزن‌ها صفر/منفی بود، به‌صورت پیش‌فرض آخرین جایزه را برگردان
  if (totalWeight <= 0) return prizes[prizes.length - 1];

  // عدد تصادفی در بازه [0, totalWeight)
  const threshold = Math.random() * totalWeight;

  // با جمع شونده جلو می‌رویم تا به آستانه برسیم
  let cumulative = 0;
  for (const prize of prizes) {
    const w = Math.max(0, prize.weight);
    cumulative += w;
    if (threshold < cumulative) {
      return prize;
    }
  }

  // در عمل نباید به اینجا برسیم؛ برای اطمینان:
  return prizes[prizes.length - 1];
}
