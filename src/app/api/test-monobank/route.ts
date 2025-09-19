import { NextRequest, NextResponse } from 'next/server'
import { monobankPaymentService } from '@/lib/payments/monobank-payment-service'
import { logger } from '@/lib/logger'

/**
 * GET /api/test-monobank - Test Monobank integration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const testType = searchParams.get('test') || 'config'

    switch (testType) {
      case 'config':
        // Test configuration
        const hasToken = !!process.env.MONOBANK_TOKEN
        const hasPublicKey = !!process.env.MONOBANK_PUBLIC_KEY

        return NextResponse.json({
          success: true,
          config: {
            hasMonobankToken: hasToken,
            hasPublicKey: hasPublicKey,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
            environment: process.env.NODE_ENV || 'unknown'
          }
        })

      case 'webhook-validation':
        // Test webhook validation logic (without real signature)
        const testBody = '{"test": "data"}'
        const testSignature = 'test-signature'

        // This will test the validation logic structure
        const isValid = monobankPaymentService.validateWebhook(testBody, testSignature)

        return NextResponse.json({
          success: true,
          validation: {
            testPerformed: true,
            validationResult: isValid,
            note: 'This is a test validation without real Monobank signature'
          }
        })

      case 'payment-creation':
        // Test payment creation with enhanced parameters
        const testPayment = await monobankPaymentService.createPayment({
          amount: 100, // 1 грн
          description: 'Тестовый платеж с улучшенными параметрами',
          reference: `test-enhanced-${Date.now()}`,
          redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/test-success`,
          webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/monobank/webhook`,
          validity: 3600, // 1 час
          paymentType: 'debit',
          merchantPaymInfo: {
            destination: 'Тестування покращеного API',
            comment: 'Тест з додатковими параметрами',
            basketOrder: [
              {
                name: 'Тестовий товар',
                qty: 1,
                sum: 10000, // 100 грн в копейках
                code: 'TEST001'
              }
            ]
          }
        })

        return NextResponse.json({
          success: true,
          payment: testPayment,
          features: {
            retryLogic: 'enabled',
            enhancedParameters: 'enabled',
            additionalFields: 'supported'
          }
        })

      case 'merchant-info':
        // Test merchant info retrieval
        const merchantInfo = await monobankPaymentService.getMerchantInfo()

        return NextResponse.json({
          success: true,
          merchantInfo,
          note: 'This shows merchant account information and configuration'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown test type. Available: config, webhook-validation, payment-creation, merchant-info'
        }, { status: 400 })
    }

  } catch (error) {
    logger.error('Monobank test API error', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}