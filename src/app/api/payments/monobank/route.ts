import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { monobankPaymentService } from '@/lib/payments/monobank-payment-service'
import { logger } from '@/lib/logger'

// Схема валидации для создания платежа
const createPaymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  customer_email: z.string().email('Invalid email format'),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  subscription_request_id: z.string().uuid().optional()
})

/**
 * POST /api/payments/monobank - Создать платеж в Monobank
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // Генерируем уникальный reference
    const reference = validatedData.subscription_request_id 
      ? `sub_${validatedData.subscription_request_id}`
      : `pay_${uuidv4()}`

    // Получаем базовый URL сайта
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stefa-books.com.ua'
    const redirectUrl = `${baseUrl}/payment/success?reference=${reference}`
    const webhookUrl = `${baseUrl}/api/payments/monobank/webhook`

    logger.info('Creating Monobank payment', {
      amount: validatedData.amount,
      description: validatedData.description,
      customer_email: validatedData.customer_email,
      reference
    })

    // Создаем платеж в Monobank
    const result = await monobankPaymentService.createPayment({
      amount: validatedData.amount,
      description: validatedData.description,
      reference,
      redirectUrl,
      webhookUrl
    })

    if (result.status === 'error') {
      logger.error('Monobank payment creation failed', {
        error: result.error,
        reference
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        }, 
        { status: 400 }
      )
    }

    logger.info('Monobank payment created successfully', {
      invoiceId: result.data!.invoiceId,
      reference
    })

    return NextResponse.json({
      success: true,
      payment: {
        invoiceId: result.data!.invoiceId,
        paymentUrl: result.data!.pageUrl,
        reference
      },
      message: 'Платіж створено успішно'
    })

  } catch (error) {
    logger.error('Monobank payment API error', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/monobank - Проверить статус платежа
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoice_id')

    if (!invoiceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'invoice_id parameter is required' 
        },
        { status: 400 }
      )
    }

    logger.info('Checking Monobank payment status', { invoiceId })

    const status = await monobankPaymentService.checkPaymentStatus(invoiceId)

    if (!status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check payment status' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      amount: status.amount,
      reference: status.reference,
      invoiceId: status.invoiceId
    })

  } catch (error) {
    logger.error('Monobank status check API error', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}