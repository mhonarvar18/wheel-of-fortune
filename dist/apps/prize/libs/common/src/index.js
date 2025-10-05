"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSG = exports.NATS_SERVERS = void 0;
exports.NATS_SERVERS = process.env.NATS_URL || 'nats://localhost:4222';
exports.MSG = {
    AUTH_REGISTER: 'auth.register',
    AUTH_LOGIN: 'auth.login',
    SPIN_EXECUTE: 'spin.execute',
    PRIZE_LIST: 'prize.list',
    PRIZE_AVAILABLE: 'prize.available',
    PRIZE_AWARDED: 'prize.awarded',
};
//# sourceMappingURL=index.js.map