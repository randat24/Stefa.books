import { logger } from '@/lib/logger'
import { createVerify } from 'crypto'

export interface MonobankPaymentRequest {
  amount: number
  description: string
  reference: string
  redirectUrl: string
  webhookUrl: string
  // Дополнительные опциональные параметры
  ccy?: number // Код валюты (по умолчанию 980 - UAH)
  validity?: number // Время жизни инвойса в секундах
  paymentType?: 'debit' | 'hold' // Тип платежа
  qrId?: string // ID для QR-кода
  merchantPaymInfo?: {
    reference?: string
    destination?: string
    comment?: string
    basketOrder?: Array<{
      name: string
      qty: number
      sum: number
      code?: string
      barcode?: string
      header?: string
      footer?: string
      tax?: number[]
    }>
  }
}

export interface MonobankPaymentResponse {
  status: 'success' | 'error'
  data?: {
    invoiceId: string
    pageUrl: string
    qrData?: string // QR код для оплаты
    shortUrl?: string // Сокращенная ссылка
  }
  error?: string
  errorCode?: string // Код ошибки от Monobank
  details?: any // Дополнительные детали ошибки
}

export interface MonobankPaymentStatus {
  status: 'new' | 'processing' | 'success' | 'failure'
  amount: number
  reference: string
  invoiceId: string
  // Дополнительные поля статуса
  ccy?: number
  createdDate?: string
  modifiedDate?: string
  paymentMethod?: string
  maskedPan?: string // Замаскированный номер карты
  approvalCode?: string // Код авторизации
  rrn?: string // Референс номер
  paymentScheme?: string // Платежная система (visa, mastercard, etc.)
}

export class MonobankPaymentService {
  private apiUrl = 'https://api.monobank.ua'
  private apiToken = process.env.MONOBANK_TOKEN || ''
  private defaultRetryOptions = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  }

  constructor() {
    if (!this.apiToken) {
      logger.warn('MonobankPaymentService: MONOBANK_TOKEN not configured')
    }
  }

  /**
   * Выполнить запрос с retry логикой
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      delayMs?: number
      backoffMultiplier?: number
      operationName?: string
    } = {}
  ): Promise<T> {
    const {
      maxRetries = this.defaultRetryOptions.maxRetries,
      delayMs = this.defaultRetryOptions.delayMs,
      backoffMultiplier = this.defaultRetryOptions.backoffMultiplier,
      operationName = 'API operation'
    } = options

    let lastError: Error | null = null
    let currentDelay = delayMs

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await operation()
        if (attempt > 1) {
          logger.info(`${operationName} succeeded on attempt ${attempt}`)
        }
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt <= maxRetries) {
          logger.warn(`${operationName} failed on attempt ${attempt}, retrying in ${currentDelay}ms`, {
            error: lastError.message,
            attempt,
            maxRetries
          })

          await new Promise(resolve => setTimeout(resolve, currentDelay))
          currentDelay *= backoffMultiplier
        }
      }
    }

    const finalError = lastError || new Error(`${operationName} failed after ${maxRetries + 1} attempts`)
    logger.error(`${operationName} failed after ${maxRetries + 1} attempts`, finalError)
    throw finalError
  }

  /**
   * Создать платеж в Monobank с retry логикой
   */
  async createPayment(req: MonobankPaymentRequest): Promise<MonobankPaymentResponse> {
    return this.executeWithRetry(
      () => this.createPaymentInternal(req),
      { operationName: 'Payment creation' }
    )
  }

  /**
   * Внутренний метод создания платежа
   */
  private async createPaymentInternal(req: MonobankPaymentRequest): Promise<MonobankPaymentResponse> {
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
        ccy: req.ccy || 980, // UAH по умолчанию
        description: `Stefa.Books - ${req.description}`,
        reference: req.reference,
        redirectUrl: req.redirectUrl,
        webhookUrl: req.webhookUrl,
        ...(req.validity && { validity: req.validity }),
        ...(req.paymentType && { paymentType: req.paymentType }),
        ...(req.qrId && { qrId: req.qrId }),
        ...(req.merchantPaymInfo && { merchantPaymInfo: req.merchantPaymInfo })
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
        let errorDetails: any = null
        let errorCode: string | undefined = undefined

        try {
          errorDetails = JSON.parse(errorText)
          errorCode = errorDetails.errorCode || errorDetails.code
        } catch {
          // Если не JSON, используем как текст
        }

        logger.error('MonobankPaymentService: API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          errorCode,
          errorDetails
        })

        return {
          status: 'error',
          error: `Monobank API error: ${response.status} ${response.statusText}`,
          errorCode,
          details: errorDetails
        }
      }

      const data = await response.json()
      
      if (data.invoiceId && data.pageUrl) {
        logger.info('MonobankPaymentService: Payment created successfully', {
          invoiceId: data.invoiceId,
          reference: req.reference,
          hasQrData: !!data.qrData,
          hasShortUrl: !!data.shortUrl
        })

        return {
          status: 'success',
          data: {
            invoiceId: data.invoiceId,
            pageUrl: data.pageUrl,
            ...(data.qrData && { qrData: data.qrData }),
            ...(data.shortUrl && { shortUrl: data.shortUrl })
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
   * Проверить статус платежа с retry логикой
   */
  async checkPaymentStatus(invoiceId: string): Promise<MonobankPaymentStatus | null> {
    try {
      return await this.executeWithRetry(
        () => this.checkPaymentStatusInternal(invoiceId),
        { operationName: 'Payment status check' }
      )
    } catch (error) {
      logger.error('MonobankPaymentService: Failed to check payment status after retries', error)
      return null
    }
  }

  /**
   * Внутренний метод проверки статуса платежа
   */
  private async checkPaymentStatusInternal(invoiceId: string): Promise<MonobankPaymentStatus | null> {
    if (!this.apiToken) {
      throw new Error('MONOBANK_TOKEN not configured for status check')
    }

    const response = await fetch(`${this.apiUrl}/api/merchant/invoice/status?invoiceId=${invoiceId}`, {
      method: 'GET',
      headers: {
        'X-Token': this.apiToken
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      status: data.status,
      amount: data.amount / 100, // Конвертируем из копеек
      reference: data.reference,
      invoiceId: data.invoiceId,
      // Дополнительные поля если они есть в ответе
      ...(data.ccy && { ccy: data.ccy }),
      ...(data.createdDate && { createdDate: data.createdDate }),
      ...(data.modifiedDate && { modifiedDate: data.modifiedDate }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      ...(data.maskedPan && { maskedPan: data.maskedPan }),
      ...(data.approvalCode && { approvalCode: data.approvalCode }),
      ...(data.rrn && { rrn: data.rrn }),
      ...(data.paymentScheme && { paymentScheme: data.paymentScheme })
    }
  }

  /**
   * Получить информацию о мерчанте
   */
  async getMerchantInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await this.executeWithRetry(
        () => this.getMerchantInfoInternal(),
        { operationName: 'Merchant info retrieval' }
      )
    } catch (error) {
      logger.error('MonobankPaymentService: Failed to get merchant info', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Внутренний метод получения информации о мерчанте
   */
  private async getMerchantInfoInternal(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.apiToken) {
      throw new Error('MONOBANK_TOKEN not configured')
    }

    const response = await fetch(`${this.apiUrl}/api/merchant/info`, {
      method: 'GET',
      headers: {
        'X-Token': this.apiToken
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      data
    }
  }

  /**
   * Валидация webhook подписи согласно документации Monobank
   * https://monobank.ua/api-docs/acquiring/instrumenty-rozrobky/webhooks/pryklady-veryfikatsii-pidpysu-webhook
   */
  validateWebhook(body: string, signature: string): boolean {
    try {
      if (!signature) {
        logger.warn('MonobankPaymentService: No signature provided for webhook validation')
        return false
      }

      // Получаем публичный ключ Monobank
      const monobankPublicKey = process.env.MONOBANK_PUBLIC_KEY
      if (!monobankPublicKey) {
        logger.warn('MonobankPaymentService: MONOBANK_PUBLIC_KEY not configured')

        // В development режиме возвращаем true для тестирования
        if (process.env.NODE_ENV === 'development') {
          logger.info('MonobankPaymentService: Skipping webhook validation in development mode')
          return true
        }

        return false
      }

      // Декодируем подпись и публичный ключ из base64
      const signatureBuf = Buffer.from(signature, 'base64')
      const publicKeyBuf = Buffer.from(monobankPublicKey, 'base64')

      // Создаем объект для верификации с алгоритмом SHA256
      const verify = createVerify('SHA256')
      verify.write(body)
      verify.end()

      // Проверяем подпись
      const isValid = verify.verify(publicKeyBuf, signatureBuf)

      logger.info('MonobankPaymentService: Webhook signature validation', {
        isValid,
        bodyLength: body.length,
        signatureLength: signature.length,
        hasPublicKey: !!monobankPublicKey
      })

      return isValid
    } catch (error) {
      logger.error('MonobankPaymentService: Webhook validation error', error)
      return false
    }
  }
}

// Экспортируем singleton instance
export const monobankPaymentService = new MonobankPaymentService()