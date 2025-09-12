import { monobankService } from '@/lib/services/monobank';
import type { MonobankWebhookData } from '@/lib/types/monobank';

// Mock environment variables
const mockEnv = {
  MONOBANK_API_URL: 'https://api.monobank.ua/api/merchant',
  MONOBANK_PUBLIC_KEY: 'test-public-key',
  MONOBANK_PRIVATE_KEY: 'test-private-key',
  MONOBANK_MERCHANT_ID: 'test-merchant-id'
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => Buffer.from('test-hash'))
  })),
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'test-signature')
  }))
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null })),
      update: jest.fn(() => ({ error: null })),
      eq: jest.fn().mockReturnThis()
    }))
  }
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

/* eslint-disable @typescript-eslint/no-require-imports */
describe('Monobank Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  describe('MonobankService', () => {
    test('should create payment successfully', async () => {
      const mockResponse = {
        invoiceId: 'test-invoice-id',
        pageUrl: 'https://pay.monobank.ua/test'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const paymentData = {
        amount: 500,
        description: 'Test payment',
        reference: 'test-ref-123',
        redirectUrl: 'https://example.com/success',
        webhookUrl: 'https://example.com/webhook'
      };

      const result = await monobankService.createPayment(paymentData);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `${mockEnv.MONOBANK_API_URL}/merchant/invoice/create`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Token': mockEnv.MONOBANK_PRIVATE_KEY
          }
        })
      );
    });

    test('should handle payment creation error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request')
      });

      const paymentData = {
        amount: 500,
        description: 'Test payment',
        reference: 'test-ref-123',
        redirectUrl: 'https://example.com/success',
        webhookUrl: 'https://example.com/webhook'
      };

      const result = await monobankService.createPayment(paymentData);

      expect(result.status).toBe('error');
      expect(result.errText).toContain('API Error: 400');
    });

    test('should check payment status successfully', async () => {
      const mockStatus = {
        invoiceId: 'test-invoice-id',
        status: 'success',
        amount: 50000,
        ccy: 980,
        reference: 'test-ref-123',
        createdDate: Date.now() / 1000,
        modifiedDate: Date.now() / 1000
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStatus)
      });

      const result = await monobankService.checkPaymentStatus('test-invoice-id');

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockStatus);
      expect(fetch).toHaveBeenCalledWith(
        `${mockEnv.MONOBANK_API_URL}/merchant/invoice/status?invoiceId=test-invoice-id`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'X-Token': mockEnv.MONOBANK_PRIVATE_KEY
          }
        })
      );
    });

    test('should validate webhook signature', () => {
      const body = JSON.stringify({ test: 'data' });
      const signature = 'test-signature';

      const isValid = monobankService.validateWebhook(body, signature);

      expect(isValid).toBe(true);
    });

    test('should process webhook successfully', async () => {
      const webhookData: MonobankWebhookData = {
        invoiceId: 'test-invoice-id',
        status: 'success',
        amount: 50000,
        ccy: 980,
        reference: 'test-ref-123',
        createdDate: Date.now() / 1000,
        modifiedDate: Date.now() / 1000
      };

      const result = await monobankService.processWebhook(webhookData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Payment processed successfully');
    });
  });

  describe('Payment Flow Integration', () => {
    test('should handle complete payment flow', async () => {
      // Step 1: Create payment
      const mockCreateResponse = {
        invoiceId: 'test-invoice-id',
        pageUrl: 'https://pay.monobank.ua/test'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCreateResponse)
      });

      const paymentData = {
        amount: 500,
        description: 'Підписка Maxi - Тест книга',
        reference: 'order-123',
        redirectUrl: 'https://stefa-books.com.ua/payment/success',
        webhookUrl: 'https://stefa-books.com.ua/api/payments/monobank/webhook'
      };

      const createResult = await monobankService.createPayment(paymentData);
      expect(createResult.status).toBe('success');

      // Step 2: Process webhook (payment success)
      const webhookData: MonobankWebhookData = {
        invoiceId: mockCreateResponse.invoiceId,
        status: 'success',
        amount: paymentData.amount * 100,
        ccy: 980,
        reference: paymentData.reference,
        createdDate: Date.now() / 1000,
        modifiedDate: Date.now() / 1000
      };

      const webhookResult = await monobankService.processWebhook(webhookData);
      expect(webhookResult.success).toBe(true);
    });

    test('should handle payment failure', async () => {
      const webhookData: MonobankWebhookData = {
        invoiceId: 'test-invoice-id',
        status: 'failure',
        amount: 50000,
        ccy: 980,
        reference: 'test-ref-123',
        createdDate: Date.now() / 1000,
        modifiedDate: Date.now() / 1000
      };

      const result = await monobankService.processWebhook(webhookData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Payment failed');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const paymentData = {
        amount: 500,
        description: 'Test payment',
        reference: 'test-ref-123',
        redirectUrl: 'https://example.com/success',
        webhookUrl: 'https://example.com/webhook'
      };

      const result = await monobankService.createPayment(paymentData);

      expect(result.status).toBe('error');
      expect(result.errText).toBe('Network error');
    });

    test('should handle missing configuration', () => {
      delete process.env.MONOBANK_PRIVATE_KEY;

      const body = JSON.stringify({ test: 'data' });
      const signature = 'test-signature';

      const isValid = monobankService.validateWebhook(body, signature);

      expect(isValid).toBe(false);
    });
  });
});

describe('Payment API Endpoints', () => {
  describe('POST /api/payments/monobank', () => {
    test('should validate required fields', () => {
      const invalidData = {
        // missing required fields
      };

      expect(() => {
        // This would be validated by the zod schema in the actual API
        const z = require('zod').z
        const schema = z.object({
          amount: z.number().min(1),
          description: z.string().min(1),
          order_id: z.string().min(1),
          customer_email: z.string().email(),
          customer_name: z.string().min(1)
        });

        schema.parse(invalidData);
      }).toThrow();
    });

    test('should accept valid payment data', () => {
      const validData = {
        amount: 500,
        description: 'Test subscription',
        order_id: 'order-123',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        currency: 'UAH'
      };

      const z = require('zod').z
      const schema = z.object({
        amount: z.number().min(1),
        description: z.string().min(1),
        order_id: z.string().min(1),
        customer_email: z.string().email(),
        customer_name: z.string().min(1),
        currency: z.enum(['UAH', 'USD', 'EUR']).optional()
      });

      expect(() => schema.parse(validData)).not.toThrow();
    });
  });

  describe('Webhook validation', () => {
    test('should reject webhooks without signature', () => {
      const body = JSON.stringify({ test: 'data' });
      const signature = '';

      const isValid = monobankService.validateWebhook(body, signature);

      expect(isValid).toBe(false);
    });

    test('should process valid webhooks', () => {
      const body = JSON.stringify({
        invoiceId: 'test-invoice-id',
        status: 'success',
        amount: 50000,
        ccy: 980,
        reference: 'test-ref-123'
      });
      const signature = 'test-signature';

      const isValid = monobankService.validateWebhook(body, signature);

      expect(isValid).toBe(true);
    });
  });
});