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
exports.SpinController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const passport_1 = require("@nestjs/passport");
const spin_request_dto_1 = require("./dtos/spin-request.dto");
let SpinController = class SpinController {
    spinClient;
    constructor(spinClient) {
        this.spinClient = spinClient;
    }
    async spin(req) {
        const userId = req.user?.userId ?? req.user?.sub;
        return (0, rxjs_1.firstValueFrom)(this.spinClient.send(MSG.SPIN_EXECUTE, { userId }).pipe((0, rxjs_1.timeout)(3000)));
    }
    async execute(body) {
        const obs$ = this.spinClient
            .send(MSG.SPIN_EXECUTE, { userId: body.userId })
            .pipe((0, rxjs_1.timeout)(3000));
        return await lastValueFrom(obs$);
    }
};
exports.SpinController = SpinController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpinController.prototype, "spin", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [spin_request_dto_1.SpinRequestDto]),
    __metadata("design:returntype", Promise)
], SpinController.prototype, "execute", null);
exports.SpinController = SpinController = __decorate([
    (0, common_1.Controller)('api/spin'),
    __param(0, (0, common_1.Inject)('SPIN_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], SpinController);
//# sourceMappingURL=spin.controller.js.map