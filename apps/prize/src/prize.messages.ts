import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { Prize } from './models/prize.model';
import { MSG } from '@app/common';

@Controller()
export class PrizeMessages {
  constructor(@InjectModel(Prize) private readonly prizeModel: typeof Prize) {}

  // لیست برای UI
  @MessagePattern(MSG.PRIZE_LIST)
  async list() {
    const rows = await this.prizeModel.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'weight', 'oneTimePerUser', 'type'],
      raw: true,
    });
    return { prizes: rows.map((r) => ({ ...r, weight: Number(r.weight) })) };
  }

  // در اختیار Spin (قوانین ساده‌ی اولیه)
  @MessagePattern(MSG.PRIZE_AVAILABLE)
  async availableForUser() {
    const rows = await this.prizeModel.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'weight', 'oneTimePerUser', 'type'],
      raw: true,
    });
    return rows.map((r) => ({ ...r, weight: Number(r.weight) }));
  }
}
