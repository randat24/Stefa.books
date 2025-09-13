import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Схема валидации для заявки на подписку (адаптирована под существующую структуру БД)
const subscriptionRequestSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email адрес'),
  phone: z.string().regex(/^\+380\d{9}$/, 'Некорректный номер телефона'),
  social: z.string().optional(),
  plan: z.enum(['mini', 'maxi'], {
    errorMap: () => ({ message: 'Неверный тип подписки' })
  }),
  paymentMethod: z.enum(['Онлайн оплата', 'Переказ на карту'], {
    errorMap: () => ({ message: 'Неверный способ оплаты' })
  }),
  message: z.string().optional(),
  screenshot: z.union([z.string(), z.instanceof(File)]).optional(),
  privacyConsent: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    // Обрабатываем JSON (файлы уже загружены на Cloudinary)
    const body = await request.json();
    const validatedData = subscriptionRequestSchema.parse(body);
    
    // Создаем Supabase клиент с service role для записи
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Маппинг способов оплаты для базы данных
    const paymentMethodMapping = {
      'Онлайн оплата': 'Онлайн оплата',
      'Переказ на карту': 'Переказ на карту'
    };

    // Сохраняем заявку на подписку
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        social: validatedData.social || null,
        plan: validatedData.plan, // Используем plan вместо subscription_type
        payment_method: paymentMethodMapping[validatedData.paymentMethod as keyof typeof paymentMethodMapping],
        message: validatedData.message || null,
        screenshot: validatedData.screenshot || null,
        privacy_consent: validatedData.privacyConsent,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error when inserting subscription request', {
        error: error,
        validatedData: validatedData,
        insertData: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          social: validatedData.social || null,
          plan: validatedData.plan, // Используем plan вместо subscription_type
          payment_method: paymentMethodMapping[validatedData.paymentMethod as keyof typeof paymentMethodMapping],
          message: validatedData.message || null,
          screenshot: validatedData.screenshot || null,
          privacy_consent: validatedData.privacyConsent,
          status: 'pending'
        }
      });
      return NextResponse.json(
        { error: 'Ошибка при сохранении заявки', details: error.message },
        { status: 500 }
      );
    }

    // Логируем успешную заявку (без персональных данных)
    logger.info('Subscription request submitted successfully', {
      requestId: data.id,
      plan: validatedData.plan,
      paymentMethod: validatedData.paymentMethod,
      hasSocial: !!(validatedData.social && validatedData.social.trim()),
      hasMessage: !!validatedData.message,
      hasScreenshot: !!validatedData.screenshot,
      timestamp: new Date().toISOString()
    });

    // Если выбран онлайн платеж, создаем платеж в Монобанке
    let paymentData = null;
    if (validatedData.paymentMethod === 'Онлайн оплата') {
      try {
        const { monobankService } = await import('@/lib/services/monobank');
        
        const amount = validatedData.plan === 'mini' ? 300 : 500; // Сумма в гривнах
        const description = `Підписка ${validatedData.plan.toUpperCase()} - ${amount} ₴`;
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?requestId=${data.id}`;
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;
        
        const reference = `sub_${data.id}_${Date.now()}`;
        
        const paymentResult = await monobankService.createPayment({
          amount,
          description,
          reference,
          redirectUrl,
          webhookUrl,
        });

        if (paymentResult.status === 'success' && paymentResult.data) {
          paymentData = {
            invoiceId: paymentResult.data.invoiceId,
            paymentUrl: paymentResult.data.pageUrl,
            reference,
          };
          
          // Обновляем заявку с данными платежа
          await supabase
            .from('subscription_requests')
            .update({ 
              admin_notes: `Payment created: ${paymentResult.data.invoiceId}` 
            })
            .eq('id', data.id);
        }
      } catch (paymentError) {
        logger.error('Payment creation failed', { 
          error: paymentError, 
          requestId: data.id 
        });
        // Не прерываем процесс, просто логируем ошибку
      }
    }

    // TODO: Отправить уведомление администратору
    // await sendAdminNotification(data);

    return NextResponse.json({
      success: true,
      message: paymentData 
        ? 'Заявку успішно надіслано! Ви будете перенаправлені на сторінку оплати.'
        : 'Заявку успішно надіслано! Ми зв\'яжемося з вами найближчим часом.',
      requestId: data.id,
      payment: paymentData
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in subscription request', { 
        errors: error.errors,
        body: request.body 
      });
      return NextResponse.json(
        { 
          error: 'Помилка валідації',
          details: error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in subscription API', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Subscription API endpoint' },
    { status: 200 }
  );
}