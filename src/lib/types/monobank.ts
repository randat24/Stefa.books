// ============================================================================
// MONOBANK API TYPES
// ============================================================================

export interface MonobankPaymentRequest {
  amount: number; // Сумма в копейках
  ccy: number; // Валюта (980 для UAH)
  merchantPaymInfo: {
    reference: string; // Уникальный идентификатор платежа
    destination: string; // Описание платежа
    basketOrder: Array<{
      name: string; // Название товара/услуги
      qty: number; // Количество
      sum: number; // Сумма в копейках
    }>;
  };
  redirectUrl: string; // URL для перенаправления после оплаты
  webHookUrl: string; // URL для уведомлений о статусе платежа
  validity: number; // Время жизни ссылки в секундах (по умолчанию 24 часа)
  paymentType: 'debit'; // Тип платежа
}

export interface MonobankPaymentResponse {
  status: 'success' | 'error';
  data?: {
    invoiceId: string; // ID инвойса
    pageUrl: string; // Ссылка для оплаты
  };
  errText?: string; // Текст ошибки
}

export interface MonobankWebhookData {
  invoiceId: string;
  status: 'success' | 'failure' | 'process';
  amount: number;
  ccy: number;
  reference: string;
  createdDate: number;
  modifiedDate: number;
}

export interface MonobankConfig {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  merchantId: string;
}

// Константы для Монобанка
export const MONOBANK_CURRENCY = {
  UAH: 980,
} as const;

export const MONOBANK_PAYMENT_TYPES = {
  DEBIT: 'debit',
} as const;

export const MONOBANK_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PROCESS: 'process',
} as const;
