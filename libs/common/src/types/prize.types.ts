export type PrizeType = 'cash' | 'coupon' | 'lottery_ticket' | 'lottery_ticket_x3';

export interface PrizeItem {
  id: string;
  name: string;
  chance: number;
}

export interface PrizeListResponse {
  prizes: PrizeItem[];
}

export type PrizeCreateItem = {
  name: string;
  type: 'cash' | 'coupon' | 'lottery_ticket' | 'lottery_ticket_x3';
  weight: string; // DECIMAL → string
  oneTimePerUser: boolean;
  active: boolean;
};

// آرایه‌ای از آیتم‌ها
export type PrizeCreate = PrizeCreateItem[];
