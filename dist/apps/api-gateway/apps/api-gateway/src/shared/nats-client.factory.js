"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNatsClient = void 0;
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const createNatsClient = (name) => ({
    name,
    imports: [],
    inject: [config_1.ConfigService],
    useFactory: (cfg) => ({
        transport: microservices_1.Transport.NATS,
        options: {
            servers: [cfg.get('NATS_URL', 'nats://127.0.0.1:4222')],
        },
    }),
});
exports.createNatsClient = createNatsClient;
//# sourceMappingURL=nats-client.factory.js.map