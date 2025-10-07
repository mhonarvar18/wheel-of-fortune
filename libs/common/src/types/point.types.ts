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

export type PointsChargeDto = {
  userId: string;
  amount: number; // مقدار مثبت: یعنی کم‌کردن از بالانس
  externalId: string; // برای ایدمپوتنسی
  meta?: Record<string, unknown>;
};
export type PointsRefundDto = {
  userId: string;
  amount: number; // مقدار مثبت: یعنی برگرداندن به بالانس
  externalId: string; // refund:<chargeId>
  meta?: Record<string, unknown>;
};

export type PointsOpResp = { ok: true; balance: number } | { ok: false; reason: string };
