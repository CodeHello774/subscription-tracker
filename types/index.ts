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
}
