import { PrizeType } from './prize.types';

export type SpinSuccess = {
  userId: string;
  prizeId: string;
  prizeName: string;
  type: PrizeType;
};

export type SpinError = { error: string; prizeId?: string };

export type SpinResult = SpinSuccess | SpinError;
