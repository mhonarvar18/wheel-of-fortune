"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrizeModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const prize_controller_1 = require("./prize.controller");
const prize_service_1 = require("./prize.service");
let PrizeModule = class PrizeModule {
};
exports.PrizeModule = PrizeModule;
exports.PrizeModule = PrizeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PRIZE_CLIENT',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (cfg) => ({
                        transport: microservices_1.Transport.NATS,
                        options: {
                            servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')],
                        },
                    }),
                },
            ]),
        ],
        controllers: [prize_controller_1.PrizeController],
        providers: [prize_service_1.PrizeService],
        exports: [prize_service_1.PrizeService],
    })
], PrizeModule);
//# sourceMappingURL=prize.module.js.map