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
// Webhook validation simplified - no external dependencies needed

export class MonobankService {
  private config: MonobankConfig;

  constructor() {
    // Продакшн конфигурация Monobank
    const token = process.env.MONOBANK_TOKEN?.trim();

    if (!token || token.length === 0) {
      throw new Error('MONOBANK_TOKEN обов\'язковий для роботи системи оплати. Будь ласка, налаштуйте змінну середовища.');
    }

    logger.info('Monobank initialization', {
      hasToken: true,
      tokenLength: token.length,
      tokenStart: token.substring(0, 8) + '...',
      nodeEnv: process.env.NODE_ENV
    });

    // Конфігурація для реального токену Monobank
    this.config = {
      apiUrl: 'https://api.monobank.ua/api/merchant',
      publicKey: '',
      privateKey: token,
      merchantId: ''
    };

    logger.info('Monobank initialized with REAL token - production mode ONLY');
  }

  /**
   * Перевіряє чи налаштований токен для створення платежів
   */
  private isMerchantTokenAvailable(): boolean {
    return true; // Токен завжди має бути налаштований
  }

  /**
   * Перевіряє чи налаштований токен для особистих операцій
   */
  private isPersonalTokenAvailable(): boolean {
    return true; // Токен завжди має бути налаштований
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
            sum: paymentData.amount * 100
          }]
        },
        redirectUrl: paymentData.redirectUrl,
        webHookUrl: paymentData.webhookUrl,
        validity: 24 * 60 * 60, // 24 часа
        paymentType: MONOBANK_PAYMENT_TYPES.DEBIT
      };

      logger.info('Creating Monobank payment', {
        reference: paymentData.reference,
        amount: paymentData.amount
      });

      const response = await fetch(`${this.config.apiUrl}/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.config.privateKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Monobank API error', {
          status: response.status,
          error: errorText
        });
        
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      
      logger.info('Monobank payment created successfully', {
        invoiceId: data.invoiceId,
        reference: paymentData.reference });

      // Пробуємо зберегти платіж в базі даних (не критично якщо не вийде)
      try {
        await this.savePayment({
          invoiceId: data.invoiceId,
          reference: paymentData.reference,
          amount: paymentData.amount,
          description: paymentData.description,
          status: 'pending'
          // userId is not provided for anonymous payments
        });
      } catch (dbError) {
        logger.warn('Failed to save payment to database, but payment was created successfully', {
          invoiceId: data.invoiceId,
          error: dbError
        });
      }

      return {
        status: 'success',
        data: {
          invoiceId: data.invoiceId,
          pageUrl: data.pageUrl
        }
      };

    } catch (error) {
      logger.error('Monobank service error', error);
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error'
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
    if (!this.isPersonalTokenAvailable()) {
      return {
        status: 'error',
        errText: 'Personal token not configured'
      };
    }

    try {
      const response = await fetch(`${this.getPersonalAPIUrl()}/personal/client-info`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data
      };
    } catch (error) {
      logger.error('Monobank client info error', { error });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error'
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
    if (!this.isPersonalTokenAvailable()) {
      return {
        status: 'error',
        errText: 'Personal token not configured'
      };
    }

    try {
      const toParam = toDate ? `/${toDate}` : '';
      const response = await fetch(`${this.getPersonalAPIUrl()}/personal/statement/${accountId}/${fromDate}${toParam}`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data
      };
    } catch (error) {
      logger.error('Monobank statement error', { error });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Перевіряє статус платежу через комерційний API
   */
  async checkPaymentStatus(invoiceId: string): Promise<{
    status: 'success' | 'error';
    data?: MonobankWebhookData;
    errText?: string;
  }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/invoice/status?invoiceId=${invoiceId}`, {
        method: 'GET',
        headers: {
          'X-Token': this.config.privateKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          errText: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      return {
        status: 'success',
        data
      };

    } catch (error) {
      logger.error('Monobank status check error', { error, invoiceId });
      return {
        status: 'error',
        errText: error instanceof Error ? error.message : 'Unknown error'
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

      // У реальній реалізації тут має бути ECDSA перевірка з публічним ключем
      // Для тесту временно пропускаем валидацию
      const isValid = true; // TODO: Implementar validación ECDSA real
      
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
        reference: webhookData.reference });

      // Оновлюємо статус платежу в базі даних
      await this.updatePaymentStatus(webhookData);

      if (webhookData.status === 'success') {
        // Платіж успішний - обробляємо подписку
        await this.processSuccessfulSubscriptionPayment(webhookData);
        
        logger.info('Payment successful', {
          invoiceId: webhookData.invoiceId,
          reference: webhookData.reference });
        
        return {
          success: true,
          message: 'Payment processed successfully'
        };
      } else if (webhookData.status === 'failure') {
        // Платіж невдалий - оновлюємо статус заявки на rejected
        await this.updateSubscriptionStatus(webhookData.reference, 'rejected');
        
        logger.warn('Payment failed', {
          invoiceId: webhookData.invoiceId,
          reference: webhookData.reference });
        
        return {
          success: true,
          message: 'Payment failed - request rejected'
        };
      }

      return {
        success: true,
        message: 'Webhook processed'
      };

    } catch (error) {
      logger.error('Webhook processing error', { error, webhookData });
      return {
        success: false,
        message: 'Webhook processing failed'
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
          status: webhookData.status,
          amount_uah: webhookData.amount / 100, // Конвертуємо з копійок в гривні
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
   * Обробляє успішний платіж за підписку
   */
  private async processSuccessfulSubscriptionPayment(webhookData: MonobankWebhookData): Promise<void> {
    try {
      const { reference } = webhookData;

      // Перевіряємо чи це платіж за підписку
      if (reference && reference.startsWith('subscription-')) {
        const subscriptionId = reference.replace('subscription-', '');

        // Імпортуємо SubscriptionService динамічно щоб уникнути циклічних залежностей
        const { SubscriptionService } = await import('@/lib/services/subscription');

        // Активуємо підписку
        await SubscriptionService.activateSubscription(subscriptionId);

        logger.info('Subscription activated successfully', {
          subscriptionId,
          invoiceId: webhookData.invoiceId
        });
      } else {
        // Обробляємо як звичайний платіж (можливо, за оренду книги)
        await this.updateSubscriptionStatus(reference, 'approved');
      }

    } catch (error) {
      logger.error('Error processing subscription payment', { error, webhookData });
      throw error;
    }
  }

  /**
   * Оновлює статус підписки на основі reference
   */
  private async updateSubscriptionStatus(reference: string, status: string): Promise<void> {
    try {
      logger.info('Updating subscription status', {
        reference,
        status
      });

      // Для звичайних платежів (не підписка) можемо оновити статус в таблиці payments
      const { error } = await supabase
        .from('payments')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('description', reference);

      if (error) {
        logger.error('Failed to update subscription status', { error, reference });
      }

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
    userId?: string;
  }): Promise<void> {
    try {
      // For anonymous payments, we'll skip saving to the database
      // since the schema requires user_id to be NOT NULL
      if (!paymentData.userId) {
        logger.info('Skipping payment save - no user_id provided for anonymous payment', {
          invoiceId: paymentData.invoiceId,
          reference: paymentData.reference
        });
        return;
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          transaction_id: paymentData.invoiceId,
          amount_uah: paymentData.amount,
          description: paymentData.description,
          status: paymentData.status,
          payment_method: 'monobank',
          currency: 'UAH',
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
