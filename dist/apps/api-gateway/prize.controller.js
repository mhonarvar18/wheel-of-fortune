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
exports.PrizeController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const MSG = { PRIZE_LIST: 'prize.list' };
let PrizeController = class PrizeController {
    prizeClient;
    constructor(prizeClient) {
        this.prizeClient = prizeClient;
    }
    list() {
        return (0, rxjs_1.firstValueFrom)(this.prizeClient.send(MSG.PRIZE_LIST, {}).pipe((0, rxjs_1.timeout)(3000)));
    }
};
exports.PrizeController = PrizeController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrizeController.prototype, "list", null);
exports.PrizeController = PrizeController = __decorate([
    (0, common_1.Controller)('api/prizes'),
    __param(0, (0, common_1.Inject)('PRIZE_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], PrizeController);
//# sourceMappingURL=prize.controller.js.map