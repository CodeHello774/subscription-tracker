const SUBSCRIPTIONS_KEY = 'subscription_tracker_subs';
const PROFILE_KEY = 'subscription_tracker_profile';

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

export function getSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '[]');
  } catch { return []; }
}

export function saveSubscriptions(subs: Subscription[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
  } catch {}
}

export function addSubscription(sub: Omit<Subscription, 'id' | 'created_at'>): Subscription {
  const subs = getSubscriptions();
  const newSub: Subscription = {
    ...sub,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  subs.push(newSub);
  saveSubscriptions(subs);
  return newSub;
}

export function updateSubscription(id: string, updates: Partial<Subscription>): Subscription[] {
  const subs = getSubscriptions();
  const idx = subs.findIndex(s => s.id === id);
  if (idx !== -1) {
    subs[idx] = { ...subs[idx], ...updates };
    saveSubscriptions(subs);
  }
  return subs;
}

export function deleteSubscription(id: string): Subscription[] {
  const subs = getSubscriptions().filter(s => s.id !== id);
  saveSubscriptions(subs);
  return subs;
}

export function getProfile() {
  if (typeof window === 'undefined') return { displayName: '' };
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"displayName":""}');
  } catch { return { displayName: '' }; }
}

export function saveProfile(profile: { displayName: string }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

const NOTIFY_KEY = 'subscription_tracker_notify';

export interface NotificationSettings {
  email: string;
  enabled: boolean;
  reminder_days: number;
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return { email: '', enabled: false, reminder_days: 3 };
  try {
    return JSON.parse(localStorage.getItem(NOTIFY_KEY) || '{"email":"","enabled":false,"reminder_days":3}');
  } catch { return { email: '', enabled: false, reminder_days: 3 }; }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(settings));
  } catch {}
}
