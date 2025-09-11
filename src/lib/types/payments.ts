// Типы для работы с платежами Монобанк

export interface MonobankPayment {
  invoice_id: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  amount: number;
  currency: 'UAH' | 'USD' | 'EUR';
  description: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  payment_url: string;
  qr_code: string;
  expires_at: string;
  created_at: string;
  paid_at?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency?: 'UAH' | 'USD' | 'EUR';
  description: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  return_url?: string;
  webhook_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment?: MonobankPayment;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment?: {
    invoice_id: string;
    status: 'pending' | 'success' | 'failed' | 'expired';
    amount: number;
    currency: string;
    created_at: string;
    paid_at?: string;
    description: string;
  };
  error?: string;
}

// Webhook типы
export interface MonobankWebhook {
  type: 'InvoicePaymentStatusChanged';
  data: {
    invoiceId: string;
    status: 'success' | 'failure' | 'expired';
    amount: number;
    ccy: number; // 980 = UAH, 840 = USD, 978 = EUR
    createdDate: string;
    modifiedDate: string;
    reference: string;
  };
}

// Константы для валют
export const CURRENCY_CODES = {
  UAH: 980,
  USD: 840,
  EUR: 978
} as const;

// Константы для статусов
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired'
} as const;

// Константы для подписок
export const SUBSCRIPTION_TYPES = {
  MINI: 'mini',
  MAXI: 'maxi',
  PREMIUM: 'premium'
} as const;

// Цены подписок в копейках (для Монобанка)
export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_TYPES.MINI]: 30000, // 300 UAH
  [SUBSCRIPTION_TYPES.MAXI]: 50000, // 500 UAH
  [SUBSCRIPTION_TYPES.PREMIUM]: 150000 // 1500 UAH
} as const;
