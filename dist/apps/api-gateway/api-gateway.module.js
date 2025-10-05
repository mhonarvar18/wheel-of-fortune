"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const api_gateway_controller_1 = require("./api-gateway.controller");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const spin_controller_1 = require("./spin.controller");
const prize_controller_1 = require("./prize.controller");
const natsClient = (name) => ({
    name,
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: (cfg) => ({
        transport: microservices_1.Transport.NATS,
        options: { servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')] },
    }),
});
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET || 'dev' }),
            microservices_1.ClientsModule.registerAsync([
                natsClient('IDENTITY_CLIENT'),
                natsClient('SPIN_CLIENT'),
                natsClient('PRIZE_CLIENT'),
            ]),
        ],
        controllers: [api_gateway_controller_1.ApiGatewayController, auth_controller_1.AuthController, spin_controller_1.SpinController, prize_controller_1.PrizeController],
        providers: [jwt_strategy_1.JwtStrategy],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map