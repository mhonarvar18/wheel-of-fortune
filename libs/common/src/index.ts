import { PrizeType } from './types/prize.types';

export const NATS_SERVERS = process.env.NATS_URL || 'nats://localhost:4222';

export const MSG = {
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  SPIN_EXECUTE: 'spin.execute',
  PRIZE_LIST: 'prize.list',
  PRIZE_AVAILABLE: 'prize.available',
  PRIZE_AWARDED: 'prize.awarded',
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
