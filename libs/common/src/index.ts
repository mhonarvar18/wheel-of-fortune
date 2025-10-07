export type * from './types/point.types';
export type * from './types/identity.types';
export type * from './types/prize.types';
export type * from './types/spin.types';
export type * from './types/billing.types';

export const REASONS = [
  'signup',
  'referral_referrer',
  'referral_referee',
  'purchase',
  'spin_award',
] as const;

import { PrizeType } from './types/prize.types';

export const NATS_SERVERS = process.env.NATS_URL || 'nats://localhost:4222';

export const MSG = {
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',

  PRIZE_LIST: 'prize.list',
  PRIZE_AVAILABLE: 'prize.available',
  PRIZE_AWARDED: 'prize.awarded',

  SPIN_EXECUTE: 'spin.execute',

  // Points
  POINTS_APPLY: 'points.apply',
  POINTS_BALANCE: 'points.balance',
  POINTS_HISTORY: 'points.history',

  // رویداد رفرال (از identity)
  REFERRAL_SIGNUP: 'referral.signup',

  // Billing
  BILLING_PURCHASE_CREATE: 'billing.purchase.create',
  BILLING_PURCHASE_STATUS: 'billing.purchase.status',
  BILLING_PURCHASE_PAID: 'billing.purchase.paid',
} as const;

export interface WeightedPrize {
  id: string;
  name: string;
  weight: number;
  oneTimePerUser: boolean;
  type: PrizeType;
}

export type PrizeAwardedEvent = {
  userId: string;
  prizeId: string;
  prizeName: string;
  type: PrizeType;
  at: string; // ISO
};
