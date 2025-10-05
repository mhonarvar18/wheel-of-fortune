import { Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Prize } from './models/prize.model';

@Controller('prizes')
export class PrizeHttpController {
  constructor(@InjectModel(Prize) private readonly prizeModel: typeof Prize) {}

  @Get()
  async list() {
    return this.prizeModel.findAll({ where: { active: true } });
  }

  // فقط برای dev: seed با وزن‌های مستند
  @Post('seed')
  async seed() {
    const items = [
      { name: 'کد تخفیف ۲۰٪ اشتراک حبل‌المتین', type: 'coupon', weight: '1.00', oneTimePerUser: true,  active: true },
      { name: 'کد تخفیف ۵۰٪ اشتراک حبل‌المتین', type: 'coupon', weight: '0.80', oneTimePerUser: true,  active: true },
      { name: 'شانس شرکت در قرعه‌کشی آخر ماه', type: 'lottery_ticket',     weight: '2.50', oneTimePerUser: false, active: true },
      { name: '۳ شانس شرکت در قرعه‌کشی آخر ماه', type: 'lottery_ticket_x3', weight: '1.50', oneTimePerUser: false, active: true },
      { name: 'جایزه نقدی ۲,۰۰۰,۰۰۰ تومان',       type: 'cash',              weight: '0.20', oneTimePerUser: true,  active: true },
      { name: 'کد تخفیف ۳۰٪ خرید از دیجیکالا',    type: 'coupon',            weight: '1.50', oneTimePerUser: true,  active: true },
      { name: 'کد تخفیف ۳۰٪ خرید از طلاسی',       type: 'coupon',            weight: '1.50', oneTimePerUser: true,  active: true },
    ];

    for (const it of items) {
      const exists = await this.prizeModel.findOne({ where: { name: it.name } });
      if (!exists) await this.prizeModel.create(it as any);
    }
    return { ok: true };
  }
}
