import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';
import { v4 as uuidv4 } from 'uuid';

// Схема для создания платежа
const createPaymentSchema = z.object({
  amount: z.number().min(1, 'Сума повинна бути більше 0'),
  currency: z.enum(['UAH', 'USD', 'EUR']).default('UAH'),
  description: z.string().min(1, 'Опис обов\'язковий'),
  order_id: z.string().min(1, 'ID замовлення обов\'язковий'),
  customer_email: z.string().email('Невірний email'),
  customer_name: z.string().min(1, 'Ім\'я клієнта обов\'язкове'),
  return_url: z.string().url('Невірний URL повернення').optional(),
  webhook_url: z.string().url('Невірний webhook URL').optional()
});

// Схема для проверки статуса платежа
const checkPaymentSchema = z.object({
  invoice_id: z.string().min(1, 'ID інвойсу обов\'язковий')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = createPaymentSchema.parse(body);
    
    logger.info('Creating Monobank payment:', {
      amount: validatedData.amount,
      currency: validatedData.currency,
      order_id: validatedData.order_id,
      customer_email: validatedData.customer_email
    });

    // Створюємо унікальний reference для платежу
    const reference = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stefa-books.com.ua';
    const redirectUrl = validatedData.return_url || `${baseUrl}/payment/success`;
    const webhookUrl = `${baseUrl}/api/payments/monobank/webhook`;

    // Створюємо платіж через Monobank API
    const paymentResult = await monobankService.createPayment({
      amount: validatedData.amount,
      description: validatedData.description,
      reference,
      redirectUrl,
      webhookUrl
    });

    if (paymentResult.status === 'error') {
      logger.error('Monobank payment creation failed:', {
        error: paymentResult.errText,
        amount: validatedData.amount,
        description: validatedData.description
      });
      
      return NextResponse.json({
        success: false,
        error: 'Не вдалося створити платіж',
        details: paymentResult.errText
      }, { status: 400 });
    }

    const payment = {
      invoice_id: paymentResult.data!.invoiceId,
      status: 'pending',
      payment_url: paymentResult.data!.pageUrl,
      amount: validatedData.amount,
      currency: validatedData.currency,
      description: validatedData.description,
      reference,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 години
      created_at: new Date().toISOString()
    };

    logger.info('Monobank payment created successfully:', {
      invoice_id: payment.invoice_id,
      reference: payment.reference,
      amount: payment.amount
    });

    return NextResponse.json({
      success: true,
      payment,
      message: 'Платіж створено успішно'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Payment validation error:', { errors: error.errors });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні дані',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in Monobank payment creation:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id');
    
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'ID інвойсу обов\'язковий' },
        { status: 400 }
      );
    }

    // Валидация
    const validatedData = checkPaymentSchema.parse({ invoice_id: invoiceId });

    logger.info('Checking Monobank payment status:', {
      invoice_id: validatedData.invoice_id
    });

    // Перевіряємо статус платежу через Monobank API
    const statusResult = await monobankService.checkPaymentStatus(validatedData.invoice_id);

    if (statusResult.status === 'error') {
      logger.error('Failed to check Monobank payment status:', {
        error: statusResult.errText,
        invoiceId: validatedData.invoice_id
      });
      
      return NextResponse.json({
        success: false,
        error: 'Не вдалося перевірити статус платежу',
        details: statusResult.errText
      }, { status: 400 });
    }

    const paymentStatus = {
      invoice_id: validatedData.invoice_id,
      status: statusResult.data!.status,
      amount: statusResult.data!.amount / 100, // Конвертуємо з копійок в гривні
      currency: statusResult.data!.ccy === 980 ? 'UAH' : 'OTHER',
      created_at: (statusResult.data!.createdDate && statusResult.data!.createdDate > 0) ? new Date(statusResult.data!.createdDate * 1000).toISOString() : new Date().toISOString(),
      modified_at: (statusResult.data!.modifiedDate && statusResult.data!.modifiedDate > 0) ? new Date(statusResult.data!.modifiedDate * 1000).toISOString() : new Date().toISOString(),
      reference: statusResult.data!.reference
    };

    logger.info('Monobank payment status retrieved:', {
      invoice_id: paymentStatus.invoice_id,
      status: paymentStatus.status,
      amount: paymentStatus.amount
    });

    return NextResponse.json({
      success: true,
      payment: paymentStatus
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні дані',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in Monobank payment status check:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
