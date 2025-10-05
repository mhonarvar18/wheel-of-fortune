"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const identity_module_1 = require("./identity.module");
const promise_1 = __importDefault(require("mysql2/promise"));
async function ensureDatabaseExists() {
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
    });
    const dbName = process.env.DB_NAME || 'identity_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`✅ Database ensured: ${dbName}`);
}
async function bootstrap() {
    const servers = [process.env.NATS_URL || 'nats://127.0.0.1:4222'];
    await ensureDatabaseExists();
    const app = await core_1.NestFactory.createMicroservice(identity_module_1.IdentityModule, {
        transport: microservices_1.Transport.NATS,
        options: {
            servers,
            tls: false,
            noRandomize: true,
            reconnect: true,
            maxReconnectAttempts: -1,
            reconnectTimeWait: 1000,
            pingInterval: 5000,
            timeout: 2000,
            verbose: true,
        },
    });
    process.on('unhandledRejection', (e) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[unhandledRejection]', msg);
    });
    process.on('uncaughtException', (e) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[uncaughtException]', msg);
    });
    await app.listen();
    console.log('✅ Identity microservice connected to NATS');
}
bootstrap();
//# sourceMappingURL=main.js.map