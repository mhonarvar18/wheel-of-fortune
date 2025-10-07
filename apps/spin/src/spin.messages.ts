import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { MSG, type WeightedPrize } from '@app/common';
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

    try {
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
      } catch (e: any) {
        await tx.rollback();
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
  const sum = prizes.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * sum;
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
}
