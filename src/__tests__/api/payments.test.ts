import { GET, POST, PUT } from '@/app/api/payments/route';
import { paymentService } from '@/lib/payments/payment-service';

// Mock the payment service
jest.mock('@/lib/payments/payment-service', () => ({
  paymentService: {
    getSubscriptionPlans: jest.fn(),
    getUserSubscriptions: jest.fn(),
    createPayment: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    processPaymentCallback: jest.fn()
  }
}));

// Mock NextRequest
const createMockRequest = (method: string, body?: any, searchParams?: Record<string, string>) => {
  return {
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    url: `http://localhost:3000/api/payments${searchParams ? `?${new URLSearchParams(searchParams).toString()}` : ''}`,
    headers: {
      get: jest.fn()
    }
  };
};

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson } }));

// Mock getServerSession
jest.mock('@/lib/auth/session', () => ({
  getServerSession: jest.fn()
}));

describe('Payment API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJson.mockImplementation((data) => ({ json: data }));
    // Reset the mock implementation
    jest.requireMock('@/lib/auth/session').getServerSession.mockResolvedValue({ user: { id: 'user_123', email: 'test@example.com' } });
  });

  describe('GET /api/payments', () => {
    it('should return subscription plans when action=plans', async () => {
      const mockPlans = [
        { id: 'basic', name: 'Basic Plan', price: 299 },
        { id: 'premium', name: 'Premium Plan', price: 499 }
      ];
      
      (paymentService.getSubscriptionPlans as jest.Mock).mockResolvedValue(mockPlans);
      
      const request = createMockRequest('GET', null, { action: 'plans' });
      await GET(request as any);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPlans
      });
      expect(paymentService.getSubscriptionPlans).toHaveBeenCalled();
    });

    it('should return user subscriptions when action=subscriptions', async () => {
      const mockSubscriptions = [
        { id: 'sub_123', planId: 'basic', status: 'active' }
      ];
      
      (paymentService.getUserSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);
      
      const request = createMockRequest('GET', null, { action: 'subscriptions' });
      
      await GET(request as any);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSubscriptions
      });
      expect(paymentService.getUserSubscriptions).toHaveBeenCalledWith('user_123');
    });

    it('should return error for invalid action', async () => {
      const request = createMockRequest('GET', null, { action: 'invalid' });
      await GET(request as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    });
  });

  describe('POST /api/payments', () => {
    it('should create a payment when action=create-payment', async () => {
      const mockPaymentResponse = {
        success: true,
        paymentUrl: 'https://payment.example.com/pay_123',
        paymentId: 'pay_123'
      };
      
      (paymentService.createPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);
      
      const requestBody = {
        action: 'create-payment',
        amount: 299,
        currency: 'UAH',
        description: 'Test payment',
        orderId: 'order_123'
      };
      
      const request = createMockRequest('POST', requestBody);
      
      await POST(request as any);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          paymentUrl: mockPaymentResponse.paymentUrl,
          paymentId: mockPaymentResponse.paymentId
        }
      });
      expect(paymentService.createPayment).toHaveBeenCalled();
    });

    it('should create a subscription when action=create-subscription', async () => {
      const mockSubscriptionResponse = {
        success: true,
        subscription: { id: 'sub_123', planId: 'basic', status: 'active' }
      };
      
      (paymentService.createSubscription as jest.Mock).mockResolvedValue(mockSubscriptionResponse);
      
      const requestBody = {
        action: 'create-subscription',
        planId: 'basic'
      };
      
      const request = createMockRequest('POST', requestBody);
      
      await POST(request as any);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSubscriptionResponse.subscription
      });
      expect(paymentService.createSubscription).toHaveBeenCalledWith('user_123', 'basic');
    });

    it('should return error for invalid action', async () => {
      const requestBody = {
        action: 'invalid-action'
      };
      
      const request = createMockRequest('POST', requestBody);
      
      await POST(request as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    });
  });

  describe('PUT /api/payments', () => {
    it('should cancel a subscription when action=cancel-subscription', async () => {
      const mockCancelResponse = {
        success: true
      };
      
      (paymentService.cancelSubscription as jest.Mock).mockResolvedValue(mockCancelResponse);
      
      const requestBody = {
        action: 'cancel-subscription',
        subscriptionId: 'sub_123'
      };
      
      const request = createMockRequest('PUT', requestBody);
      
      await PUT(request as any);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Subscription cancelled successfully'
      });
      expect(paymentService.cancelSubscription).toHaveBeenCalledWith('sub_123');
    });

    it('should return error for invalid action', async () => {
      const requestBody = {
        action: 'invalid-action'
      };
      
      const request = createMockRequest('PUT', requestBody);
      
      await PUT(request as any);
      
      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    });
  });
});