"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrizeSeeder = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const prize_model_1 = require("../models/prize.model");
let PrizeSeeder = class PrizeSeeder {
    prizeModel;
    constructor(prizeModel) {
        this.prizeModel = prizeModel;
    }
    async onModuleInit() {
        const count = await this.prizeModel.count();
        if (count > 0)
            return;
        const seeds = [
            {
                name: 'کد تخفیف ۲۰٪ خرید اشتراک حبل المتین',
                type: 'coupon',
                weight: '1',
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
                oneTimePerUser: true,
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
        ];
        await this.prizeModel.bulkCreate(seeds, { validate: true });
        console.log('✅ Prize seeds inserted.');
    }
};
exports.PrizeSeeder = PrizeSeeder;
exports.PrizeSeeder = PrizeSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(prize_model_1.Prize)),
    __metadata("design:paramtypes", [Object])
], PrizeSeeder);
//# sourceMappingURL=prize.seeder.js.map