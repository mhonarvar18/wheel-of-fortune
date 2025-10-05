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
exports.SpinService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const sequelize_1 = require("@nestjs/sequelize");
const rxjs_1 = require("rxjs");
const spin_model_1 = require("./models/spin.model");
const awarded_prize_model_1 = require("./models/awarded-prize.model");
const common_2 = require("../../../libs/common/src");
let SpinService = class SpinService {
    prizeClient;
    spinModel;
    awardedModel;
    redis;
    constructor(prizeClient, spinModel, awardedModel, redis) {
        this.prizeClient = prizeClient;
        this.spinModel = spinModel;
        this.awardedModel = awardedModel;
        this.redis = redis;
    }
    async execute(payload) {
        const userId = payload.userId;
        const lockKey = `spin:lock:${userId}`;
        const locked = await this.redis.set(lockKey, '1', 'PX', 3000, 'NX');
        if (locked !== 'OK')
            return { error: 'SPIN_IN_PROGRESS' };
        try {
            const allPrizes = await (0, rxjs_1.lastValueFrom)(this.prizeClient.send(common_2.MSG.PRIZE_AVAILABLE, { userId }).pipe((0, rxjs_1.timeout)(3000)));
            if (!allPrizes?.length)
                return { error: 'NO_PRIZE_AVAILABLE' };
            const awarded = await this.awardedModel.findAll({
                where: { userId },
                attributes: ['prizeId'],
                raw: true,
            });
            const awardedSet = new Set(awarded.map(a => a.prizeId));
            const available = allPrizes.filter(p => !(p.oneTimePerUser && awardedSet.has(p.id)));
            if (!available.length)
                return { error: 'NO_PRIZE_AVAILABLE_FOR_USER' };
            const chosen = this.weightedPick(available);
            const tx = await this.spinModel.sequelize.transaction();
            try {
                await this.spinModel.create({ userId, prizeId: chosen.id, resultMeta: { prizeName: chosen.name, type: chosen.type } }, { transaction: tx });
                if (chosen.oneTimePerUser) {
                    await this.awardedModel.create({ userId, prizeId: chosen.id }, { transaction: tx });
                }
                await tx.commit();
                this.prizeClient.emit(common_2.MSG.PRIZE_AWARDED, {
                    userId,
                    prizeId: chosen.id,
                    prizeName: chosen.name,
                    type: chosen.type,
                    at: new Date().toISOString(),
                });
            }
            catch (e) {
                await tx.rollback();
                if (e?.name === 'SequelizeUniqueConstraintError') {
                    return { error: 'ALREADY_AWARDED', prizeId: chosen.id };
                }
                throw e;
            }
            return { userId, prizeId: chosen.id, prizeName: chosen.name, type: chosen.type };
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
    weightedPick(prizes) {
        const sum = prizes.reduce((s, p) => s + p.weight, 0);
        let r = Math.random() * sum;
        for (const p of prizes) {
            r -= p.weight;
            if (r <= 0)
                return p;
        }
        return prizes[prizes.length - 1];
    }
};
exports.SpinService = SpinService;
__decorate([
    (0, microservices_1.MessagePattern)(common_2.MSG.SPIN_EXECUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpinService.prototype, "execute", null);
exports.SpinService = SpinService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRIZE_CLIENT')),
    __param(1, (0, sequelize_1.InjectModel)(spin_model_1.Spin)),
    __param(2, (0, sequelize_1.InjectModel)(awarded_prize_model_1.AwardedPrize)),
    __param(3, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy, Object, Object, Function])
], SpinService);
//# sourceMappingURL=spin.service.js.map