import { logger } from '@/lib/logger'

export interface MonobankPaymentRequest {
  amount: number
  description: string
  reference: string
  redirectUrl: string
  webhookUrl: string
}

export interface MonobankPaymentResponse {
  status: 'success' | 'error'
  data?: {
    invoiceId: string
    pageUrl: string
  }
  error?: string
}

export interface MonobankPaymentStatus {
  status: 'new' | 'processing' | 'success' | 'failure'
  amount: number
  reference: string
  invoiceId: string
}

export class MonobankPaymentService {
  private apiUrl = 'https://api.monobank.ua'
  private apiToken = process.env.MONOBANK_TOKEN || ''

  constructor() {
    if (!this.apiToken) {
      logger.warn('MonobankPaymentService: MONOBANK_TOKEN not configured')
    }
  }

  /**
   * Создать платеж в Monobank
   */
  async createPayment(req: MonobankPaymentRequest): Promise<MonobankPaymentResponse> {
    try {
      if (!this.apiToken) {
        return {
          status: 'error',
          error: 'Monobank token not configured'
        }
      }

      // Monobank ожидает сумму в копейках
      const payload = {
        amount: req.amount * 100,
        ccy: 980, // UAH
        description: `Stefa.Books - ${req.description}`,
        reference: req.reference,
        redirectUrl: req.redirectUrl,
        webhookUrl: req.webhookUrl
      }

      logger.info('MonobankPaymentService: Creating payment', {
        amount: req.amount,
        reference: req.reference,
        description: req.description
      })

      const response = await fetch(`${this.apiUrl}/api/merchant/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.apiToken
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('MonobankPaymentService: API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        return {
          status: 'error',
          error: `Monobank API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      
      if (data.invoiceId && data.pageUrl) {
        logger.info('MonobankPaymentService: Payment created successfully', {
          invoiceId: data.invoiceId,
          reference: req.reference
        })

        return {
          status: 'success',
          data: {
            invoiceId: data.invoiceId,
            pageUrl: data.pageUrl
          }
        }
      } else {
        logger.error('MonobankPaymentService: Invalid response format', { data })
        return {
          status: 'error',
          error: 'Invalid response from Monobank API'
        }
      }
    } catch (error) {
      logger.error('MonobankPaymentService: Payment creation error', error)
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Проверить статус платежа
   */
  async checkPaymentStatus(invoiceId: string): Promise<MonobankPaymentStatus | null> {
    try {
      if (!this.apiToken) {
        logger.warn('MonobankPaymentService: MONOBANK_TOKEN not configured for status check')
        return null
      }

      const response = await fetch(`${this.apiUrl}/api/merchant/invoice/status?invoiceId=${invoiceId}`, {
        method: 'GET',
        headers: {
          'X-Token': this.apiToken
        }
      })

      if (!response.ok) {
        logger.error('MonobankPaymentService: Status check API error', {
          status: response.status,
          statusText: response.statusText
        })
        return null
      }

      const data = await response.json()
      
      return {
        status: data.status,
        amount: data.amount / 100, // Конвертируем из копеек
        reference: data.reference,
        invoiceId: data.invoiceId
      }
    } catch (error) {
      logger.error('MonobankPaymentService: Status check error', error)
      return null
    }
  }

  /**
   * Валидация webhook подписи (опционально)
   */
  validateWebhook(body: string, signature: string): boolean {
    // В реальной реализации здесь должна быть проверка подписи
    // Monobank использует HMAC-SHA256 для подписи webhook'ов
    logger.info('MonobankPaymentService: Webhook validation (placeholder)', {
      bodyLength: body.length,
      hasSignature: !!signature
    })
    
    // Пока возвращаем true, но в продакшене нужно реализовать проверку
    return true
  }
}

// Экспортируем singleton instance
export const monobankPaymentService = new MonobankPaymentService()