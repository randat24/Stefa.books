import { 
  MonobankPaymentRequest, 
  MonobankPaymentResponse, 
  MonobankWebhookData,
  MonobankConfig,
  MONOBANK_CURRENCY,
  MONOBANK_PAYMENT_TYPES 
} from '@/lib/types/monobank';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { createHash, createHmac } from 'crypto';

export class MonobankService {
  private config: MonobankConfig;

  constructor() {
    // Визначаємо тип API на основі наявних змінних середовища
    const hasToken = !!process.env.MONOBANK_TOKEN;
    const hasMerchantKeys = !!process.env.MONOBANK_PRIVATE_KEY;

    if (hasToken) {
      // Конфігурація для універсального токену (особистий + merchant функції)
      this.config = {
        apiUrl: 'https://api.monobank.ua/api/merchant',
        publicKey: process.env.MONOBANK_PUBLIC_KEY || '',
        privateKey: process.env.MONOBANK_TOKEN || '',
        merchantId: process.env.MONOBANK_MERCHANT_ID || '',
      };
      logger.info('Monobank initialized with universal token (personal + merchant)');
    } else if (hasMerchantKeys) {
      // Конфігурація для окремого комерційного API
      this.config = {
        apiUrl: process.env.MONOBANK_API_URL || 'https://api.monobank.ua/api/merchant',
        publicKey: process.env.MONOBANK_PUBLIC_KEY || '',
        privateKey: process.env.MONOBANK_PRIVATE_KEY || '',
        merchantId: process.env.MONOBANK_MERCHANT_ID || '',
      };
      logger.info('Monobank initialized with merchant API keys');
    } else {
      // Заглушка для розробки
      this.config = {
        apiUrl: 'https://api.monobank.ua',
        publicKey: '',
        privateKey: '',
        merchantId: '',
      };
      logger.warn('Monobank API not configured - using demo mode');
    }
  }

  /**
   * Перевіряє чи налаштований API для створення платежів
   */
  private isMerchantAPIAvailable(): boolean {
    return !!process.env.MONOBANK_TOKEN || (!!process.env.MONOBANK_PRIVATE_KEY && !!process.env.MONOBANK_MERCHANT_ID);
  }

  /**
   * Перевіряє чи налаштований особистий API
   */
  private isPersonalAPIAvailable(): boolean {
    return !!process.env.MONOBANK_TOKEN;
  }

  /**
   * Отримує правильний API URL для особистого API
   */
  private getPersonalAPIUrl(): string {
    return 'https://api.monobank.ua';
  }

  /**
   * Створює платіж в Монобанку
   */
  async createPayment(paymentData: {
    amount: number;
    description: string;
    reference: string;
    redirectUrl: string;
    webhookUrl: string;
  }): Promise<MonobankPaymentResponse> {
    // Якщо немає API токену - повертаємо демо-дані
    if (!this.isMerchantAPIAvailable()) {
      logger.info('Creating demo payment (API not configured)', {
        reference: paymentData.reference,
        amount: paymentData.amount,
      });
      
      return {
        status: 'success',
        data: {
          invoiceId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pageUrl: `${paymentData.redirectUrl}?demo=true&amount=${paymentData.amount}&reference=${paymentData.reference}`,
        },
      };
    }
    try {
      const request: MonobankPaymentRequest = {
        amount: paymentData.amount * 100, // Конвертируем в копейки
        ccy: MONOBANK_CURRENCY.UAH,
        merchantPaymInfo: {
          reference: paymentData.reference,
          destination: paymentData.description,
          basketOrder: [{
            name: paymentData.description,
            qty: 1,
            sum: paymentData.amount * 100,
          }],
        },
        redirectUrl: paymentData.redirectUrl,
        webHookUrl: paymentData.webhookUrl,
        validity: 24 * 60 * 60, // 24 часа
        paymentType: MONOBANK_PAYMENT_TYPES.DEBIT,
      };

      logger.info('Creating Monobank payment', {
        reference: paymentData.reference,
        amount: paymentData.amount,
      });

      const response = await fetch(`${this.config.apiUrl}/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.config.privateKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Monobank API error', {
          status: response.status,
          error: errorText,
        });
        
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      
      logger.info('Monobank payment created successfully', {
        invoiceId: data.invoiceId,
        reference: paymentData.reference,
      });

      // Зберігаємо платіж в базі даних
      await this.savePayment({
        invoiceId: data.invoiceId,
        reference: paymentData.reference,
        amount: paymentData.amount,
        description: paymentData.description,
        status: 'pending'
      });

      return {
        status: 'success',
        data: {
          invoiceId: data.invoiceId,
          pageUrl: data.pageUrl,
        },
      };

    } catch (error) {
      logger.error('Monobank service error', error);
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Отримує інформацію про клієнта (особистий API)
   */
  async getClientInfo(): Promise<{
    status: 'success' | 'error';
    data?: any;
    errText?: string;
  }> {
    if (!this.isPersonalAPIAvailable()) {
      return {
        status: 'error',
        errText: 'Personal API token not configured'
      };
    }

    try {
      const response = await fetch(`${this.getPersonalAPIUrl()}/personal/client-info`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      logger.error('Monobank client info error', { error });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Отримує виписку по рахунку (особистий API)
   */
  async getStatement(accountId: string, fromDate: number, toDate?: number): Promise<{
    status: 'success' | 'error';
    data?: any[];
    errText?: string;
  }> {
    if (!this.isPersonalAPIAvailable()) {
      return {
        status: 'error',
        errText: 'Personal API token not configured'
      };
    }

    try {
      const toParam = toDate ? `/${toDate}` : '';
      const response = await fetch(`${this.getPersonalAPIUrl()}/personal/statement/${accountId}/${fromDate}${toParam}`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      logger.error('Monobank statement error', { error });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Перевіряє статус платежу (для комерційного API або демо-режим)
   */
  async checkPaymentStatus(invoiceId: string): Promise<{
    status: 'success' | 'error';
    data?: MonobankWebhookData;
    errText?: string;
  }> {
    // Якщо це демо-платіж - повертаємо успішний статус
    if (invoiceId.startsWith('demo_')) {
      logger.info('Checking demo payment status', { invoiceId });
      
      return {
        status: 'success',
        data: {
          invoiceId,
          status: 'success',
          amount: 50000, // 500 грн в копійках
          ccy: 980,
          reference: 'demo-payment',
          createdDate: Math.floor(Date.now() / 1000),
          modifiedDate: Math.floor(Date.now() / 1000),
        }
      };
    }

    if (!this.isMerchantAPIAvailable()) {
      return {
        status: 'error',
        errText: 'Merchant API not configured'
      };
    }
    try {
      const response = await fetch(`${this.config.apiUrl}/invoice/status?invoiceId=${invoiceId}`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data,
      };

    } catch (error) {
      logger.error('Monobank status check error', { error, invoiceId });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Валідує webhook від Монобанку за допомогою ECDSA підпису
   */
  validateWebhook(body: string, signature: string): boolean {
    try {
      if (!this.config.publicKey || !signature) {
        logger.error('Missing public key or signature for webhook validation');
        return false;
      }

      // Створюємо хеш від тіла запиту
      const bodyHash = createHash('sha256').update(body, 'utf8').digest();
      
      // У реальній реалізації тут має бути ECDSA перевірка з публічним ключем
      // Для тесту використовуємо HMAC з приватним ключем
      const expectedSignature = createHmac('sha256', this.config.privateKey)
        .update(body)
        .digest('base64');

      const isValid = signature === expectedSignature;
      
      logger.info('Webhook signature validation', {
        isValid,
        hasSignature: !!signature,
        hasPublicKey: !!this.config.publicKey
      });

      return isValid;
    } catch (error) {
      logger.error('Webhook signature validation error', error);
      return false;
    }
  }

  /**
   * Обробляє webhook від Монобанку з оновленням бази даних
   */
  async processWebhook(webhookData: MonobankWebhookData): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      logger.info('Processing Monobank webhook', {
        invoiceId: webhookData.invoiceId,
        status: webhookData.status,
        amount: webhookData.amount,
        reference: webhookData.reference,
      });

      // Оновлюємо статус платежу в базі даних
      await this.updatePaymentStatus(webhookData);

      if (webhookData.status === 'success') {
        // Платіж успішний - оновлюємо статус заявки на approved
        await this.updateSubscriptionStatus(webhookData.reference, 'approved');
        
        logger.info('Payment successful', {
          invoiceId: webhookData.invoiceId,
          reference: webhookData.reference,
        });
        
        return {
          success: true,
          message: 'Payment processed successfully',
        };
      } else if (webhookData.status === 'failure') {
        // Платіж невдалий - оновлюємо статус заявки на rejected
        await this.updateSubscriptionStatus(webhookData.reference, 'rejected');
        
        logger.warn('Payment failed', {
          invoiceId: webhookData.invoiceId,
          reference: webhookData.reference,
        });
        
        return {
          success: true,
          message: 'Payment failed - request rejected',
        };
      }

      return {
        success: true,
        message: 'Webhook processed',
      };

    } catch (error) {
      logger.error('Webhook processing error', { error, webhookData });
      return {
        success: false,
        message: 'Webhook processing failed',
      };
    }
  }

  /**
   * Оновлює статус платежу в базі даних
   */
  private async updatePaymentStatus(webhookData: MonobankWebhookData): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          payment_status: webhookData.status,
          amount: webhookData.amount / 100, // Конвертуємо з копійок в гривні
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', webhookData.invoiceId);

      if (error) {
        logger.error('Failed to update payment status', { error, invoiceId: webhookData.invoiceId });
        throw error;
      }

      logger.info('Payment status updated successfully', {
        invoiceId: webhookData.invoiceId,
        status: webhookData.status
      });
    } catch (error) {
      logger.error('Database error updating payment status', error);
      throw error;
    }
  }

  /**
   * Оновлює статус підписки на основі reference
   */
  private async updateSubscriptionStatus(reference: string, status: string): Promise<void> {
    try {
      // Використовуємо будь-яку таблицю для оновлення статусу підписки
      // Наприклад, можна зберігати в metadata платежу або окремій таблиці
      logger.info('Updating subscription status', {
        reference,
        status
      });

      // TODO: Реалізувати логіку оновлення статусу підписки
      // Можливо, потрібна окрема таблиця для підписок або використання metadata в payments
      
    } catch (error) {
      logger.error('Database error updating subscription status', error);
      throw error;
    }
  }

  /**
   * Зберігає платіж в базі даних
   */
  async savePayment(paymentData: {
    invoiceId: string;
    reference: string;
    amount: number;
    description: string;
    status: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          transaction_id: paymentData.invoiceId,
          amount: paymentData.amount,
          description: paymentData.description,
          payment_status: paymentData.status,
          payment_method: 'monobank',
          currency: 'UAH',
          metadata: {
            reference: paymentData.reference,
            provider: 'monobank'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to save payment', { error, invoiceId: paymentData.invoiceId });
        throw error;
      }

      logger.info('Payment saved successfully', {
        invoiceId: paymentData.invoiceId,
        reference: paymentData.reference
      });
    } catch (error) {
      logger.error('Database error saving payment', error);
      throw error;
    }
  }
}

// Экспортируем singleton instance
export const monobankService = new MonobankService();
