import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Prize } from '../models/prize.model';
import { PrizeCreate } from '@app/common/src/types/prize.types';

/**
 * در بوت سرویس، اگر جدول prizes خالی بود، مقداردهی اولیه می‌کند.
 * برای جلوگیری از تکرار، بر اساس name چک می‌کند.
 */
@Injectable()
export class PrizeSeeder implements OnModuleInit {
  constructor(@InjectModel(Prize) private readonly prizeModel: typeof Prize) {}

  async onModuleInit(): Promise<void> {
    // اگر قبلاً داده‌ای وجود دارد، هیچ کاری نکن
    const count = await this.prizeModel.count();
    if (count > 0) return;

    const seeds: PrizeCreate = [
      {
        name: 'کد تخفیف ۲۰٪ خرید اشتراک حبل المتین',
        type: 'coupon',
        weight: '1', // ← DECIMAL به صورت string
        oneTimePerUser: true,
        active: true,
      },
      {
        name: 'کد تخفیف ۵۰٪ خرید اشتراک حبل المتین',
        type: 'coupon',
        weight: '0.8',
        oneTimePerUser: true,
        active: true,
      },
      {
        name: 'شانس شرکت در قرعه‌کشی آخر ماه',
        type: 'lottery_ticket',
        weight: '2.5',
        oneTimePerUser: false,
        active: true,
      },
      {
        name: '۳ شانس شرکت در قرعه‌کشی آخر ماه',
        type: 'lottery_ticket_x3',
        weight: '1.5',
        oneTimePerUser: false,
        active: true,
      },
      {
        name: 'جایزه نقدی ۲ میلیون تومان',
        type: 'cash',
        weight: '0.2',
        oneTimePerUser: true, // معمولاً نقدی one-time منطقی است
        active: true,
      },
      {
        name: 'کد تخفیف ۳۰٪ خرید از دیجی‌کالا',
        type: 'coupon',
        weight: '1.5',
        oneTimePerUser: true,
        active: true,
      },
      {
        name: 'کد تخفیف ۳۰٪ خرید از طلاسی',
        type: 'coupon',
        weight: '1.5',
        oneTimePerUser: true,
        active: true,
      },
    ] as const;

    // اگر دوست داری در دفعات بعدی هم idempotent باشد، می‌توانی findOrCreate بزنی
    await this.prizeModel.bulkCreate(seeds, { validate: true });
    console.log('✅ Prize seeds inserted.');
  }
}
