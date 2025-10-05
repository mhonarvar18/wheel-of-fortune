import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import type { Redis } from 'ioredis';         // ✅ type-only
import { lastValueFrom, timeout } from 'rxjs';
import { Spin } from './models/spin.model';
import { AwardedPrize } from './models/awarded-prize.model';
import { MSG, PrizeAwardedEvent } from '@app/common';

type WeightedPrize = {
  id: string;
  name: string;
  weight: number;
  oneTimePerUser: boolean;
  type: 'cash' | 'coupon' | 'lottery_ticket' | 'lottery_ticket_x3';
};

@Injectable()
export class SpinService {
  constructor(
    @Inject('PRIZE_CLIENT') private readonly prizeClient: ClientProxy,
    @InjectModel(Spin) private readonly spinModel: typeof Spin,
    @InjectModel(AwardedPrize) private readonly awardedModel: typeof AwardedPrize,
    @Inject('REDIS') private readonly redis: Redis,      // ✅ نوع دقیق
  ) { }

  @MessagePattern(MSG.SPIN_EXECUTE)
  async execute(payload: { userId: string }) {
    const userId = payload.userId;

    const lockKey = `spin:lock:${userId}`;
    // ioredis: 'OK' | null
    const locked = await (this.redis as any).set(lockKey, '1', 'PX', 3000, 'NX');
    if (locked !== 'OK') return { error: 'SPIN_IN_PROGRESS' };

    try {
      // NATS call با timeout بهتره
      const allPrizes = await lastValueFrom(
        this.prizeClient.send<WeightedPrize[]>(MSG.PRIZE_AVAILABLE, { userId }).pipe(timeout(3000))
      );
      if (!allPrizes?.length) return { error: 'NO_PRIZE_AVAILABLE' };

      const awarded = await this.awardedModel.findAll({
        where: { userId },
        attributes: ['prizeId'],
        raw: true,
      }) as { prizeId: string }[];

      const awardedSet = new Set(awarded.map(a => a.prizeId));
      const available = allPrizes.filter(p => !(p.oneTimePerUser && awardedSet.has(p.id)));
      if (!available.length) return { error: 'NO_PRIZE_AVAILABLE_FOR_USER' };

      const chosen = this.weightedPick(available);

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

        // publish event (fire-and-forget)
        this.prizeClient.emit<PrizeAwardedEvent>(MSG.PRIZE_AWARDED, {
          userId,
          prizeId: chosen.id,
          prizeName: chosen.name,
          type: chosen.type,
          at: new Date().toISOString(),
        });
      } catch (e: any) {
        await tx.rollback();
        if (e?.name === 'SequelizeUniqueConstraintError') {
          return { error: 'ALREADY_AWARDED', prizeId: chosen.id };
        }
        throw e;
      }

      // TODO: publish prize.awarded
      return { userId, prizeId: chosen.id, prizeName: chosen.name, type: chosen.type };
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private weightedPick(prizes: WeightedPrize[]) {
    const sum = prizes.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * sum;
    for (const p of prizes) { r -= p.weight; if (r <= 0) return p; }
    return prizes[prizes.length - 1];
  }
}