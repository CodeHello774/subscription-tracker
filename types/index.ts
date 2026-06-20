export interface PaymentRecord {
  date: string;
  amount: number;
  note?: string;
}

export interface PriceRecord {
  date: string;
  price: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  next_payment_date: string;
  category: string;
  created_at: string;
  notify?: boolean;
  trial_end_date?: string;
  promo_end_date?: string;
  promo_price?: number;
  last_used_date?: string;
  shared_with?: { name: string; contribution: number }[];
  payment_history?: PaymentRecord[];
  price_history?: PriceRecord[];
}

export interface BudgetSettings {
  amount: number;
  enabled: boolean;
}

export interface DetoxChallenge {
  target: number;
  start_date: string;
  current: number;
}
