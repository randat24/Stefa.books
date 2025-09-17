/**
 * Типы для системы подписок
 */

export type SubscriptionType = 'mini' | 'maxi';

export type SubscriptionStatus = 'active' | 'expired' | 'pending' | 'cancelled';

export interface Subscription {
  id: string;
  user_id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  payment_id?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  max_books: number;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionType, SubscriptionPlan> = {
  mini: {
    type: 'mini',
    name: 'Мini підписка',
    description: 'Підписка на 1 книгу одночасно',
    price: 199,
    duration_months: 1,
    features: [
      '1 книга одночасно',
      'Безкоштовна доставка',
      'Підтримка 24/7'
    ],
    max_books: 1
  },
  maxi: {
    type: 'maxi',
    name: 'Maxi підписка',
    description: 'Підписка на 3 книги одночасно',
    price: 499,
    duration_months: 1,
    features: [
      '3 книги одночасно',
      'Безкоштовна доставка',
      'Пріоритетна підтримка',
      'Раннй доступ до новинок'
    ],
    max_books: 3
  }
};

export interface CreateSubscriptionRequest {
  user_id: string;
  subscription_type: SubscriptionType;
  payment_method: 'monobank' | 'card';
  duration_months?: number;
  auto_renew?: boolean;
}

export interface SubscriptionPaymentData {
  subscription_id: string;
  amount: number;
  currency: string;
  description: string;
  customer_email: string;
  customer_name: string;
}