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
exports.PrizeMessages = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const sequelize_1 = require("@nestjs/sequelize");
const prize_model_1 = require("./models/prize.model");
const common_2 = require("../../../libs/common/src");
let PrizeMessages = class PrizeMessages {
    prizeModel;
    constructor(prizeModel) {
        this.prizeModel = prizeModel;
    }
    async list() {
        const rows = await this.prizeModel.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'weight', 'oneTimePerUser', 'type'],
            raw: true,
        });
        return { prizes: rows.map((r) => ({ ...r, weight: Number(r.weight) })) };
    }
    async availableForUser() {
        const rows = await this.prizeModel.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'weight', 'oneTimePerUser', 'type'],
            raw: true,
        });
        return rows.map((r) => ({ ...r, weight: Number(r.weight) }));
    }
};
exports.PrizeMessages = PrizeMessages;
__decorate([
    (0, microservices_1.MessagePattern)(common_2.MSG.PRIZE_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrizeMessages.prototype, "list", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.MSG.PRIZE_AVAILABLE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrizeMessages.prototype, "availableForUser", null);
exports.PrizeMessages = PrizeMessages = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, sequelize_1.InjectModel)(prize_model_1.Prize)),
    __metadata("design:paramtypes", [Object])
], PrizeMessages);
//# sourceMappingURL=prize.messages.js.map