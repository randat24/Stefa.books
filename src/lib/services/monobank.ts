import { 
  MonobankPaymentRequest, 
  MonobankPaymentResponse, 
  MonobankWebhookData,
  MonobankConfig,
  MONOBANK_CURRENCY,
  MONOBANK_PAYMENT_TYPES 
} from '@/lib/types/monobank';
import { logger } from '@/lib/logger';

export class MonobankService {
  private config: MonobankConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.MONOBANK_API_URL || 'https://api.monobank.ua/api',
      publicKey: process.env.MONOBANK_PUBLIC_KEY || '',
      privateKey: process.env.MONOBANK_PRIVATE_KEY || '',
      merchantId: process.env.MONOBANK_MERCHANT_ID || '',
    };
  }

  /**
   * Создает платеж в Монобанке
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

      const response = await fetch(`${this.config.apiUrl}/merchant/invoice/create`, {
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
   * Проверяет статус платежа
   */
  async checkPaymentStatus(invoiceId: string): Promise<{
    status: 'success' | 'error';
    data?: MonobankWebhookData;
    errText?: string;
  }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/merchant/invoice/status?invoiceId=${invoiceId}`, {
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
   * Валидирует webhook от Монобанка
   */
  validateWebhook(data: any, signature: string): boolean {
    // Здесь должна быть логика проверки подписи
    // Для простоты пока возвращаем true
    // В продакшене нужно реализовать проверку HMAC подписи
    return true;
  }

  /**
   * Обрабатывает webhook от Монобанка
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

      // Здесь должна быть логика обновления статуса заявки в базе данных
      // Например, обновление subscription_requests с invoiceId

      if (webhookData.status === 'success') {
        // Платеж успешен - обновляем статус заявки на approved
        logger.info('Payment successful', {
          invoiceId: webhookData.invoiceId,
          reference: webhookData.reference,
        });
        
        return {
          success: true,
          message: 'Payment processed successfully',
        };
      } else if (webhookData.status === 'failure') {
        // Платеж не удался - обновляем статус заявки на rejected
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
}

// Экспортируем singleton instance
export const monobankService = new MonobankService();
