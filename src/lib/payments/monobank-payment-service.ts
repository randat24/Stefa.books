import { logger } from '@/lib/logger';

// ============================================================================
// MONOBANK PAYMENT API SERVICE
// ============================================================================

export interface MonobankPaymentRequest {
  amount: number;
  description: string;
  reference: string;
  redirectUrl: string;
  webhookUrl: string;
}

export interface MonobankPaymentResponse {
  status: 'success' | 'error';
  data?: {
    invoiceId: string;
    pageUrl: string;
  };
  error?: string;
}

export interface MonobankPaymentStatus {
  status: 'success' | 'error';
  data?: {
    invoiceId: string;
    status: 'new' | 'processing' | 'success' | 'failure';
    amount: number;
    ccy: number;
    description: string;
    reference: string;
    createdDate: string;
    modifiedDate: string;
  };
  error?: string;
}

export class MonobankPaymentService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.MONOBANK_API_URL || 'https://api.monobank.ua';
    this.apiToken = process.env.MONOBANK_API_TOKEN || '';
    
    if (!this.apiToken) {
      logger.warn('MonobankPaymentService: No API token provided');
    }
  }

  /**
   * Create a new payment
   */
  async createPayment(request: MonobankPaymentRequest): Promise<MonobankPaymentResponse> {
    try {
      if (!this.apiToken) {
        logger.warn('MonobankPaymentService: No API token available, using test mode');
        
        // В тестовом режиме возвращаем ссылку на реальную страницу оплаты
        const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://stefa-books.com.ua'}/payment?amount=${request.amount}&description=${encodeURIComponent(request.description)}&plan=mini&name=&email=&phone=+380`;
        
        return {
          status: 'success',
          data: {
            invoiceId: `test_${Date.now()}`,
            pageUrl: paymentUrl
          }
        };
      }

      const payload = {
        amount: request.amount * 100, // Convert to kopecks
        ccy: 980, // UAH
        description: request.description,
        reference: request.reference,
        redirectUrl: request.redirectUrl,
        webhookUrl: request.webhookUrl
      };

      logger.info('MonobankPaymentService: Creating payment', {
        amount: payload.amount,
        description: payload.description,
        reference: payload.reference
      });

      const response = await fetch(`${this.apiUrl}/api/merchant/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.apiToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('MonobankPaymentService: API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return {
          status: 'error',
          error: `API error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      
      logger.info('MonobankPaymentService: Payment created successfully', {
        invoiceId: data.invoiceId,
        pageUrl: data.pageUrl
      });

      return {
        status: 'success',
        data: {
          invoiceId: data.invoiceId,
          pageUrl: data.pageUrl
        }
      };

    } catch (error) {
      logger.error('MonobankPaymentService: Error creating payment', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceId: string): Promise<MonobankPaymentStatus> {
    try {
      if (!this.apiToken) {
        logger.error('MonobankPaymentService: No API token available');
        return {
          status: 'error',
          error: 'API token not configured'
        };
      }

      logger.info('MonobankPaymentService: Checking payment status', { invoiceId });

      const response = await fetch(`${this.apiUrl}/api/merchant/invoice/status?invoiceId=${invoiceId}`, {
        method: 'GET',
        headers: {
          'X-Token': this.apiToken
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('MonobankPaymentService: Status check API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return {
          status: 'error',
          error: `API error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      
      logger.info('MonobankPaymentService: Payment status retrieved', {
        invoiceId,
        status: data.status,
        amount: data.amount
      });

      return {
        status: 'success',
        data: {
          invoiceId: data.invoiceId,
          status: data.status,
          amount: data.amount / 100, // Convert from kopecks
          ccy: data.ccy,
          description: data.description,
          reference: data.reference,
          createdDate: data.createdDate,
          modifiedDate: data.modifiedDate
        }
      };

    } catch (error) {
      logger.error('MonobankPaymentService: Error checking payment status', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const monobankPaymentService = new MonobankPaymentService();
