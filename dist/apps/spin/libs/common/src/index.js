"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSG = exports.NATS_SERVERS = void 0;
exports.NATS_SERVERS = process.env.NATS_URL || 'nats://localhost:4222';
exports.MSG = {
    AUTH_REGISTER: 'auth.register',
    AUTH_LOGIN: 'auth.login',
    PRIZE_LIST: 'prize.list',
    PRIZE_AVAILABLE: 'prize.available',
    PRIZE_AWARDED: 'prize.awarded',
    SPIN_EXECUTE: 'spin.execute',
    POINTS_APPLY: 'points.apply',
    POINTS_BALANCE: 'points.balance',
    POINTS_HISTORY: 'points.history',
    REFERRAL_SIGNUP: 'referral.signup',
};
//# sourceMappingURL=index.js.map