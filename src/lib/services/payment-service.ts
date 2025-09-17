import { 
  CreatePaymentRequest, 
  PaymentResponse, 
  PaymentStatusResponse,
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_TYPES 
} from '@/lib/types/payments';
import { logger } from '@/lib/logger';

export class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Создание платежа через Монобанк
   */
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/monobank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        logger.error('Payment creation failed:', { 
          status: response.status, 
          error: result.error 
        });
        return result;
      }

      logger.info('Payment created successfully:', {
        invoice_id: result.payment?.invoice_id,
        amount: paymentData.amount
      });

      return result;
    } catch (error) {
      logger.error('Error creating payment:', error);
      return {
        success: false,
        error: 'Помилка при створенні платежу'
      };
    }
  }

  /**
   * Проверка статуса платежа
   */
  async checkPaymentStatus(invoiceId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/payments/monobank?invoice_id=${encodeURIComponent(invoiceId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json' }
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        logger.error('Payment status check failed:', { 
          status: response.status, 
          error: result.error 
        });
        return result;
      }

      return result;
    } catch (error) {
      logger.error('Error checking payment status:', error);
      return {
        success: false,
        error: 'Помилка при перевірці статусу платежу'
      };
    }
  }

  /**
   * Создание платежа для подписки
   */
  async createSubscriptionPayment(
    subscriptionType: 'mini' | 'maxi' | 'premium',
    customerEmail: string,
    customerName: string,
    orderId: string
  ): Promise<PaymentResponse> {
    const amount = SUBSCRIPTION_PRICES[subscriptionType];
    const description = `Підписка Stefa.books - ${subscriptionType.toUpperCase()}`;

    return this.createPayment({
      amount,
      currency: 'UAH',
      description,
      order_id: orderId,
      customer_email: customerEmail,
      customer_name: customerName,
      return_url: `${this.baseUrl}/subscription/success`,
      webhook_url: `${this.baseUrl}/api/payments/monobank/webhook`
    });
  }

  /**
   * Получение цены подписки в копейках
   */
  getSubscriptionPrice(subscriptionType: 'mini' | 'maxi' | 'premium'): number {
    return SUBSCRIPTION_PRICES[subscriptionType];
  }

  /**
   * Конвертация копеек в гривны
   */
  formatAmount(amountInKopecks: number): string {
    return (amountInKopecks / 100).toFixed(2);
  }

  /**
   * Получение названия подписки
   */
  getSubscriptionName(subscriptionType: string): string {
    const names = {
      [SUBSCRIPTION_TYPES.MINI]: 'Mini',
      [SUBSCRIPTION_TYPES.MAXI]: 'Maxi',
      [SUBSCRIPTION_TYPES.PREMIUM]: 'Premium'
    };
    return names[subscriptionType as keyof typeof names] || subscriptionType;
  }
}

// Экспортируем singleton instance
export const paymentService = new PaymentService();
