export type Currency = 'IRR' | 'IRT' | 'USD';

export type PurchaseCreateDto = {
  userId: string;
  itemId: string; // شناسه پلن/محصول
  amount: number; // مبلغ به واحد currency
  currency: Currency;
  externalId: string; // برای idempotency (مثلا order-<uuid>)
  meta?: Record<string, unknown>;
};

export type Purchase = {
  id: string;
  userId: string;
  itemId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  externalId: string;
  paymentRef?: string | null; // مرجع در درگاه
  meta?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseCreateResponse =
  | { ok: true; purchaseId: string; paymentUrl?: string | null }
  | { ok: false; reason: string };

export type PurchaseStatusResponse =
  | { ok: true; status: Purchase['status']; purchaseId: string }
  | { ok: false; reason: string };
