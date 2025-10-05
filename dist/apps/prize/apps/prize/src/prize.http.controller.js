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
exports.PrizeHttpController = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const prize_model_1 = require("./models/prize.model");
let PrizeHttpController = class PrizeHttpController {
    prizeModel;
    constructor(prizeModel) {
        this.prizeModel = prizeModel;
    }
    async list() {
        return this.prizeModel.findAll({ where: { active: true } });
    }
    async seed() {
        const items = [
            { name: 'کد تخفیف ۲۰٪ اشتراک حبل‌المتین', type: 'coupon', weight: '1.00', oneTimePerUser: true, active: true },
            { name: 'کد تخفیف ۵۰٪ اشتراک حبل‌المتین', type: 'coupon', weight: '0.80', oneTimePerUser: true, active: true },
            { name: 'شانس شرکت در قرعه‌کشی آخر ماه', type: 'lottery_ticket', weight: '2.50', oneTimePerUser: false, active: true },
            { name: '۳ شانس شرکت در قرعه‌کشی آخر ماه', type: 'lottery_ticket_x3', weight: '1.50', oneTimePerUser: false, active: true },
            { name: 'جایزه نقدی ۲,۰۰۰,۰۰۰ تومان', type: 'cash', weight: '0.20', oneTimePerUser: true, active: true },
            { name: 'کد تخفیف ۳۰٪ خرید از دیجیکالا', type: 'coupon', weight: '1.50', oneTimePerUser: true, active: true },
            { name: 'کد تخفیف ۳۰٪ خرید از طلاسی', type: 'coupon', weight: '1.50', oneTimePerUser: true, active: true },
        ];
        for (const it of items) {
            const exists = await this.prizeModel.findOne({ where: { name: it.name } });
            if (!exists)
                await this.prizeModel.create(it);
        }
        return { ok: true };
    }
};
exports.PrizeHttpController = PrizeHttpController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrizeHttpController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrizeHttpController.prototype, "seed", null);
exports.PrizeHttpController = PrizeHttpController = __decorate([
    (0, common_1.Controller)('prizes'),
    __param(0, (0, sequelize_1.InjectModel)(prize_model_1.Prize)),
    __metadata("design:paramtypes", [Object])
], PrizeHttpController);
//# sourceMappingURL=prize.http.controller.js.map