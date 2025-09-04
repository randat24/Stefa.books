import { paymentService } from '@/lib/payments/payment-service';

describe('Payment Integration', () => {
  it('should handle complete payment flow', async () => {
    // 1. Get subscription plans
    const plans = await paymentService.getSubscriptionPlans();
    expect(plans).toHaveLength(3);
    
    // 2. Create a subscription
    const subscriptionResult = await paymentService.createSubscription('user_123', plans[0].id);
    expect(subscriptionResult.success).toBe(true);
    expect(subscriptionResult.subscription).toBeDefined();
    
    // 3. Create a payment for the subscription
    const paymentResult = await paymentService.createPayment({
      amount: plans[0].price,
      currency: plans[0].currency,
      description: `Subscription payment for ${plans[0].name}`,
      orderId: `order_${Date.now()}`,
      userId: 'user_123',
      email: 'test@example.com'
    });
    
    expect(paymentResult.success).toBe(true);
    expect(paymentResult.paymentId).toBeDefined();
    expect(paymentResult.paymentUrl).toBeDefined();
    
    // 4. Process payment callback
    const callbackResult = await paymentService.processPaymentCallback({
      paymentId: paymentResult.paymentId,
      status: 'success',
      transactionId: `txn_${Date.now()}`
    });
    
    expect(callbackResult.success).toBe(true);
    
    // 5. Cancel subscription
    if (subscriptionResult.subscription) {
      const cancelResult = await paymentService.cancelSubscription(subscriptionResult.subscription.id);
      expect(cancelResult.success).toBe(true);
    }
  });
});