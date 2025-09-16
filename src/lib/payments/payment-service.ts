import { logger } from '@/lib/logger';
import { monobankService } from './monobank-service';

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: 'month' | 'quarter' | 'year';
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private provider: 'liqpay' | 'fondy' = 'liqpay'; // Default provider

  constructor() {
    // Initialize payment provider based on environment variables
    if (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER) {
      this.provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as 'liqpay' | 'fondy';
    }
  }

  /**
   * Create a payment request
   */
  async createPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      logger.info('PaymentService: Creating payment', { 
        orderId: data.orderId, 
        amount: data.amount,
        userId: data.userId 
      });

      // In a real implementation, this would integrate with a payment provider
      // For now, we'll simulate the payment creation
      
      // Generate a mock payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate a mock payment URL
      const paymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/checkout?paymentId=${paymentId}`;
      
      // Save payment to database (in a real implementation)
      await this.savePaymentToDatabase({
        ...data,
        paymentId,
        status: 'pending'
      });

      logger.info('PaymentService: Payment created successfully', { paymentId });
      
      return {
        success: true,
        paymentUrl,
        paymentId
      };
    } catch (error) {
      logger.error('PaymentService: Payment creation error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process payment callback
   */
  async processPaymentCallback(callbackData: any): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('PaymentService: Processing payment callback', { callbackData });

      // In a real implementation, this would verify the callback data
      // and update the payment status in the database
      
      // Extract payment information from callback
      const { paymentId, status, transactionId } = callbackData;
      
      // Update payment status in database
      await this.updatePaymentStatus(paymentId, status, transactionId);
      
      // If payment is successful, activate subscription
      if (status === 'success') {
        await this.activateSubscription(paymentId);
      }

      logger.info('PaymentService: Payment callback processed successfully', { paymentId, status });
      
      return {
        success: true
      };
    } catch (error) {
      logger.error('PaymentService: Payment callback processing error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Актуальні тарифи Stefa.Books
    return [
      {
        id: 'mini',
        name: 'Mini',
        description: '1 книга за раз на місяць',
        price: 300,
        currency: 'UAH',
        duration: 'month',
        features: [
          '1 книга за раз',
          'Безкоштовна доставка по Україні',
          'Підтримка українською',
          'Можливість обміну на іншу книгу'
        ]
      },
      {
        id: 'maxi',
        name: 'Maxi',
        description: 'До 2 книг за раз на місяць',
        price: 500,
        currency: 'UAH',
        duration: 'month',
        features: [
          'До 2 книг за раз',
          'Безкоштовна доставка по Україні',
          'Пріоритетна підтримка',
          'Можливість обміну на інші книги',
          'Доступ до нових надходжень'
        ]
      },
      {
        id: 'premium_half_year',
        name: 'Premium півроку',
        description: 'До 2 книг зі знижкою на півроку',
        price: 2500, // економія 500 грн (2500 замість 3000)
        currency: 'UAH',
        duration: 'quarter', // використовуємо quarter для 6 місяців (будемо множити на 2)
        features: [
          'До 2 книг за раз',
          'Безкоштовна доставка по Україні',
          'Пріоритетна підтримка',
          'Можливість обміну на інші книги',
          'Доступ до нових надходжень',
          'Економія 500 грн за півроку'
        ]
      }
    ];
  }

  /**
   * Create a subscription for user
   */
  async createSubscription(userId: string, planId: string): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      logger.info('PaymentService: Creating subscription', { userId, planId });

      // Get plan details
      const plans = await this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return {
          success: false,
          error: 'Invalid plan ID'
        };
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      switch (plan.duration) {
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarter':
          // Для плану premium_half_year це буде 6 місяців
          if (plan.id === 'premium_half_year') {
            endDate.setMonth(endDate.getMonth() + 6);
          } else {
            endDate.setMonth(endDate.getMonth() + 3);
          }
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Create subscription object
      const subscription: Subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        planId,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save subscription to database (in a real implementation)
      await this.saveSubscriptionToDatabase(subscription);

      logger.info('PaymentService: Subscription created successfully', { subscriptionId: subscription.id });
      
      return {
        success: true,
        subscription
      };
    } catch (error) {
      logger.error('PaymentService: Subscription creation error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('PaymentService: Cancelling subscription', { subscriptionId });

      // Update subscription status in database
      await this.updateSubscriptionStatus(subscriptionId, 'cancelled');

      logger.info('PaymentService: Subscription cancelled successfully', { subscriptionId });
      
      return {
        success: true
      };
    } catch (error) {
      logger.error('PaymentService: Subscription cancellation error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(_userId: string): Promise<Subscription[]> { // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
      // In a real implementation, this would fetch from the database
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('PaymentService: Get user subscriptions error', error);
      return [];
    }
  }

  /**
   * Save payment to database
   */
  private async savePaymentToDatabase(paymentData: any): Promise<void> {
    // In a real implementation, this would save to the database
    logger.info('PaymentService: Saving payment to database (mock)', { paymentData });
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(paymentId: string, status: string, transactionId?: string): Promise<void> {
    // In a real implementation, this would update the database
    logger.info('PaymentService: Updating payment status in database (mock)', { paymentId, status, transactionId });
  }

  /**
   * Save subscription to database
   */
  private async saveSubscriptionToDatabase(subscription: Subscription): Promise<void> {
    // In a real implementation, this would save to the database
    logger.info('PaymentService: Saving subscription to database (mock)', { subscription });
  }

  /**
   * Update subscription status in database
   */
  private async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    // In a real implementation, this would update the database
    logger.info('PaymentService: Updating subscription status in database (mock)', { subscriptionId, status });
  }

  /**
   * Activate subscription after successful payment
   */
  private async activateSubscription(paymentId: string): Promise<void> {
    // In a real implementation, this would activate the subscription
    logger.info('PaymentService: Activating subscription (mock)', { paymentId });
  }

  /**
   * Check Monobank payment status
   */
  async checkMonobankPayment(
    account: string,
    amount: number,
    description?: string,
    timeWindowHours: number = 24
  ): Promise<{ received: boolean; transaction?: any }> {
    try {
      logger.info('PaymentService: Checking Monobank payment', { account, amount, description });
      
      const result = await monobankService.checkPaymentReceived(
        account,
        amount,
        description,
        timeWindowHours
      );

      logger.info('PaymentService: Monobank payment check result', result);
      return result;
    } catch (error) {
      logger.error('PaymentService: Monobank payment check error', error);
      return { received: false };
    }
  }

  /**
   * Get Monobank currency rates
   */
  async getMonobankCurrencyRates(): Promise<any[]> {
    try {
      logger.info('PaymentService: Getting Monobank currency rates');
      
      const rates = await monobankService.getCurrencyRates();
      
      logger.info('PaymentService: Monobank currency rates fetched successfully');
      return rates;
    } catch (error) {
      logger.error('PaymentService: Monobank currency rates error', error);
      return [];
    }
  }

  /**
   * Get USD to UAH exchange rate
   */
  async getUsdToUahRate(): Promise<number | null> {
    try {
      logger.info('PaymentService: Getting USD to UAH rate');
      
      const rate = await monobankService.getUahToUsdRate();
      
      if (rate) {
        // Convert from UAH/USD to USD/UAH
        const usdToUahRate = 1 / rate;
        logger.info('PaymentService: USD to UAH rate fetched', { rate: usdToUahRate });
        return usdToUahRate;
      }
      
      return null;
    } catch (error) {
      logger.error('PaymentService: USD to UAH rate error', error);
      return null;
    }
  }

  /**
   * Convert USD to UAH using Monobank rate
   */
  async convertUsdToUah(usdAmount: number): Promise<number | null> {
    try {
      const rate = await this.getUsdToUahRate();
      if (rate) {
        return Math.round(usdAmount * rate * 100) / 100; // Round to 2 decimal places
      }
      return null;
    } catch (error) {
      logger.error('PaymentService: USD to UAH conversion error', error);
      return null;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();