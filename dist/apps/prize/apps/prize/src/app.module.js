"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const prize_model_1 = require("./models/prize.model");
const prize_http_controller_1 = require("./prize.http.controller");
const prize_messages_1 = require("./prize.messages");
const prize_seeder_1 = require("./seeder/prize.seeder");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    dialect: 'mysql',
                    host: cfg.get('DB_HOST', 'localhost'),
                    port: +cfg.get('DB_PORT', '3306'),
                    username: cfg.get('DB_USER', 'root'),
                    password: cfg.get('DB_PASS', 'root'),
                    database: cfg.get('DB_NAME', 'prize_db'),
                    models: [prize_model_1.Prize],
                    synchronize: true,
                    autoLoadModels: true,
                    logging: false,
                }),
            }),
            sequelize_1.SequelizeModule.forFeature([prize_model_1.Prize]),
        ],
        controllers: [prize_http_controller_1.PrizeHttpController, prize_messages_1.PrizeMessages],
        providers: [prize_seeder_1.PrizeSeeder],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map