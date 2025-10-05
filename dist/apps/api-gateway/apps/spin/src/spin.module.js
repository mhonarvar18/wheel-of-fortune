"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinModule = exports.REDIS_TOKEN = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const microservices_1 = require("@nestjs/microservices");
const spin_service_1 = require("./spin.service");
const spin_model_1 = require("./models/spin.model");
const awarded_prize_model_1 = require("./models/awarded-prize.model");
const ioredis_1 = __importStar(require("ioredis"));
exports.REDIS_TOKEN = 'REDIS';
let SpinModule = class SpinModule {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async onModuleInit() {
        console.log('[SpinModule] Initializing connections...');
        try {
            await this.redis.ping();
            console.log('[Redis] ping success');
        }
        catch (e) {
            console.error('[Redis] ping failed ❌', e.message);
        }
    }
    async onModuleDestroy() {
        console.log('[SpinModule] shutting down...');
        try {
            await this.redis.quit();
            console.log('[Redis] disconnected gracefully');
        }
        catch {
        }
    }
};
exports.SpinModule = SpinModule;
exports.SpinModule = SpinModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    dialect: 'mysql',
                    host: cfg.get('DB_HOST', '127.0.0.1'),
                    port: +cfg.get('DB_PORT', '3306'),
                    username: cfg.get('DB_USER', 'root'),
                    password: cfg.get('DB_PASS', 'root'),
                    database: cfg.get('DB_NAME', 'spin_db'),
                    models: [spin_model_1.Spin, awarded_prize_model_1.AwardedPrize],
                    synchronize: true,
                    autoLoadModels: true,
                    logging: false,
                    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
                }),
            }),
            sequelize_1.SequelizeModule.forFeature([spin_model_1.Spin, awarded_prize_model_1.AwardedPrize]),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PRIZE_CLIENT',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (cfg) => ({
                        transport: microservices_1.Transport.NATS,
                        options: {
                            servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')],
                            reconnect: true,
                            maxReconnectAttempts: -1,
                            tls: false,
                            noRandomize: true,
                            pingInterval: 5000,
                            timeout: 2000,
                        },
                    }),
                },
            ]),
        ],
        providers: [
            spin_service_1.SpinService,
            {
                provide: exports.REDIS_TOKEN,
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const url = cfg.get('REDIS_URL', 'redis://127.0.0.1:6379');
                    console.log('[Redis] connecting to', url);
                    const client = new ioredis_1.default(url, {
                        lazyConnect: false,
                        family: 4,
                        maxRetriesPerRequest: 1,
                        enableReadyCheck: true,
                        retryStrategy: (times) => Math.min(times * 200, 1000),
                        reconnectOnError: (err) => {
                            console.error('[Redis reconnect]', err.message);
                            return true;
                        },
                    });
                    client.on('connect', () => console.log('[Redis] connected ✅'));
                    client.on('ready', () => console.log('[Redis] ready'));
                    client.on('end', () => console.warn('[Redis] connection ended'));
                    client.on('reconnecting', () => console.log('[Redis] reconnecting...'));
                    client.on('error', (e) => console.error('[Redis error]', e.message));
                    return client;
                },
            },
        ],
    }),
    __param(0, (0, common_1.Inject)(exports.REDIS_TOKEN)),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], SpinModule);
//# sourceMappingURL=spin.module.js.map