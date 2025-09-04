import { paymentService } from '@/lib/payments/payment-service';

describe('PaymentService', () => {
  describe('getSubscriptionPlans', () => {
    it('should return subscription plans', async () => {
      const plans = await paymentService.getSubscriptionPlans();
      
      expect(plans).toHaveLength(3);
      expect(plans[0]).toHaveProperty('id');
      expect(plans[0]).toHaveProperty('name');
      expect(plans[0]).toHaveProperty('price');
      expect(plans[0]).toHaveProperty('duration');
    });
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        amount: 299,
        currency: 'UAH',
        description: 'Test payment',
        orderId: 'test_order_123',
        userId: 'user_123',
        email: 'test@example.com'
      };

      const result = await paymentService.createPayment(paymentData);
      
      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.paymentUrl).toBeDefined();
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      const result = await paymentService.createSubscription('user_123', 'basic_monthly');
      
      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
      expect(result.subscription?.id).toBeDefined();
      expect(result.subscription?.planId).toBe('basic_monthly');
      expect(result.subscription?.status).toBe('active');
    });

    it('should fail for invalid plan ID', async () => {
      const result = await paymentService.createSubscription('user_123', 'invalid_plan');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid plan ID');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription successfully', async () => {
      // First create a subscription
      const createResult = await paymentService.createSubscription('user_123', 'basic_monthly');
      
      if (createResult.success && createResult.subscription) {
        const cancelResult = await paymentService.cancelSubscription(createResult.subscription.id);
        
        expect(cancelResult.success).toBe(true);
      }
    });
  });

  describe('processPaymentCallback', () => {
    it('should process payment callback successfully', async () => {
      const callbackData = {
        paymentId: 'pay_123',
        status: 'success',
        transactionId: 'txn_123'
      };

      const result = await paymentService.processPaymentCallback(callbackData);
      
      expect(result.success).toBe(true);
    });
  });
});