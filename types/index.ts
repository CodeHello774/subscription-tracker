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
