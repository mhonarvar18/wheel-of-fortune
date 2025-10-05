"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const user_model_1 = require("./models/user.model");
const identity_controller_1 = require("./identity.controller");
const identity_service_1 = require("./identity.service");
const jwt_1 = require("@nestjs/jwt");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    secret: cfg.get('JWT_SECRET', 'dev'),
                    signOptions: { expiresIn: cfg.get('JWT_EXPIRES', '1d') },
                }),
            }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    dialect: 'mysql',
                    host: cfg.get('DB_HOST', 'localhost'),
                    port: +cfg.get('DB_PORT', '3306'),
                    username: cfg.get('DB_USER', 'root'),
                    password: cfg.get('DB_PASS', 'root'),
                    database: cfg.get('DB_NAME', 'identity_db'),
                    models: [user_model_1.User],
                    synchronize: true,
                    autoLoadModels: true,
                    logging: false,
                }),
            }),
            sequelize_1.SequelizeModule.forFeature([user_model_1.User]),
        ],
        controllers: [identity_controller_1.IdentityController],
        providers: [identity_service_1.IdentityService],
        exports: [identity_service_1.IdentityService],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map