import { REASONS } from '../index';

// ✔ نوع از روی مقدار استنتاج می‌شود
export type PointsReason = (typeof REASONS)[number];

// DTOها
export type PointsApplyDto = {
  userId: string;
  delta: number; // مثبت/منفی
  reason: PointsReason;
  externalId: string; // برای idempotency (مثلاً "referral:referee:<userId>")
  meta?: Record<string, unknown>;
};

export type PointsEntry = {
  id: string;
  userId: string;
  delta: number;
  reason: PointsReason;
  externalId: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
};

export type PointsBalanceResponse = {
  userId: string;
  balance: number;
  updatedAt: string;
};

export type PointsHistoryResponse = {
  items: PointsEntry[];
};

export type ReferralSignupEvent = {
  referrerId: string;
  refereeId: string;
  at: string; // ISO
};
