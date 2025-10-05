"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const spin_controller_1 = require("./spin.controller");
const spin_service_1 = require("./spin.service");
const nats_client_factory_1 = require("../../shared/nats-client.factory");
let SpinModule = class SpinModule {
};
exports.SpinModule = SpinModule;
exports.SpinModule = SpinModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, microservices_1.ClientsModule.registerAsync([(0, nats_client_factory_1.createNatsClient)('SPIN_CLIENT')])],
        controllers: [spin_controller_1.SpinController],
        providers: [spin_service_1.SpinGatewayService],
        exports: [spin_service_1.SpinGatewayService],
    })
], SpinModule);
//# sourceMappingURL=spin.module.js.map