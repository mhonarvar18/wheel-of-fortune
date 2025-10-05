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
const passport_1 = require("@nestjs/passport");
const spin_service_1 = require("./spin.service");
const auth_user_decorator_1 = require("../../common/auth-user.decorator");
let SpinController = class SpinController {
    spinSvc;
    constructor(spinSvc) {
        this.spinSvc = spinSvc;
    }
    async execute(userId) {
        return this.spinSvc.execute(userId);
    }
};
exports.SpinController = SpinController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, auth_user_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpinController.prototype, "execute", null);
exports.SpinController = SpinController = __decorate([
    (0, common_1.Controller)('api/spin'),
    __metadata("design:paramtypes", [spin_service_1.SpinGatewayService])
], SpinController);
//# sourceMappingURL=spin.controller.js.map