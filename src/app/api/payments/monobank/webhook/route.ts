import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { monobankPaymentService } from '@/lib/payments/monobank-payment-service'
import { subscriptionService } from '@/lib/payments/subscription-service'
import { logger } from '@/lib/logger'

// Схема валидации webhook от Monobank
const webhookSchema = z.object({
  invoiceId: z.string(),
  status: z.enum(['new', 'processing', 'success', 'failure']),
  amount: z.number(),
  reference: z.string(),
  ccy: z.number().optional(),
  createdDate: z.string().optional(),
  modifiedDate: z.string().optional()
})

/**
 * POST /api/payments/monobank/webhook - Обработка webhook от Monobank
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем тело запроса и подпись
    const body = await request.text()
    const signature = request.headers.get('X-Sign') || ''

    logger.info('Received Monobank webhook', {
      bodyLength: body.length,
      hasSignature: !!signature
    })

    // Валидируем подпись (опционально)
    if (!monobankPaymentService.validateWebhook(body, signature)) {
      logger.warn('Monobank webhook signature validation failed')
      // В реальной реализации здесь должна быть проверка подписи
      // return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    // Парсим JSON
    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (error) {
      logger.error('Failed to parse webhook JSON', error)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Валидируем данные webhook
    const validatedData = webhookSchema.parse(webhookData)

    logger.info('Processing Monobank webhook', {
      invoiceId: validatedData.invoiceId,
      status: validatedData.status,
      amount: validatedData.amount,
      reference: validatedData.reference
    })

      // Обрабатываем только успешные платежи
      if (validatedData.status === 'success') {
        // Проверяем, является ли это платежом за подписку
        if (validatedData.reference.startsWith('sub_')) {
          const requestId = validatedData.reference.replace('sub_', '')
          
          logger.info('Processing subscription payment', {
            requestId,
            invoiceId: validatedData.invoiceId,
            amount: validatedData.amount
          })

          // Активируем подписку
          const activationResult = await subscriptionService.activateSubscription({
            requestId,
            invoiceId: validatedData.invoiceId,
            amount: validatedData.amount / 100, // Конвертируем из копеек
            paymentMethod: 'monobank'
          })

          if (!activationResult.success) {
            logger.error('Failed to activate subscription', {
              requestId,
              error: activationResult.error
            })
            
            return NextResponse.json(
              { success: false, error: 'Failed to activate subscription' },
              { status: 500 }
            )
          }

          logger.info('Subscription activated successfully', {
            requestId,
            subscriptionId: activationResult.data?.subscriptionId
          })
        } else {
          // Обработка обычных платежей (не подписки)
          logger.info('Processing regular payment', {
            invoiceId: validatedData.invoiceId,
            amount: validatedData.amount,
            reference: validatedData.reference
          })

          // Здесь можно добавить логику для обработки обычных платежей
          // Например, обновление статуса заказа, отправка уведомлений и т.д.
        }
      } else if (validatedData.status === 'failure') {
        logger.warn('Payment failed', {
          invoiceId: validatedData.invoiceId,
          reference: validatedData.reference
        })

        // Обновляем статус заявки на подписку на 'rejected' если это была подписка
        if (validatedData.reference.startsWith('sub_')) {
          const requestId = validatedData.reference.replace('sub_', '')
          
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              { auth: { persistSession: false } }
            )

            await supabase
              .from('subscription_requests')
              .update({
                status: 'rejected',
                admin_notes: `Платеж не прошел. Invoice ID: ${validatedData.invoiceId}`
              })
              .eq('id', requestId)

            logger.info('Subscription request marked as rejected', { requestId })
          } catch (error) {
            logger.error('Failed to update subscription request status', { error, requestId })
          }
        }
      }

    // Всегда возвращаем успешный ответ Monobank'у
    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Monobank webhook processing error', error)
    
    if (error instanceof z.ZodError) {
      logger.error('Webhook validation error', {
        errors: error.errors
      })
      
      return NextResponse.json(
        { success: false, error: 'Validation error' },
        { status: 400 }
      )
    }

    // Даже при ошибке возвращаем 200, чтобы Monobank не повторял запрос
    return NextResponse.json({ success: false, error: 'Processing error' })
  }
}