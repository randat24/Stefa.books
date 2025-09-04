import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Схема валидации для заявки на подписку
const subscriptionRequestSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email адрес'),
  phone: z.string().regex(/^\+380\d{9}$/, 'Некорректный номер телефона'),
  social: z.string().optional(),
  plan: z.enum(['mini', 'maxi', 'premium'], {
    errorMap: () => ({ message: 'Неверный тип подписки' })
  }),
  payment_method: z.enum(['monobank', 'online', 'cash'], {
    errorMap: () => ({ message: 'Неверный способ оплаты' })
  }),
  message: z.string().optional(),
  screenshot: z.string().optional(),
  privacy_consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие с политикой конфиденциальности'
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
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

    // Вставляем заявку в базу данных
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        social: validatedData.social || null,
        plan: validatedData.plan,
        payment_method: validatedData.payment_method,
        message: validatedData.message || null,
        screenshot: validatedData.screenshot || null,
        privacy_consent: validatedData.privacy_consent,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error when inserting subscription request', { error });
      return NextResponse.json(
        { error: 'Ошибка при сохранении заявки' },
        { status: 500 }
      );
    }

    // Логируем успешную заявку (без персональных данных)
    logger.info('Subscription request submitted successfully', {
      requestId: data.id,
      plan: validatedData.plan,
      paymentMethod: validatedData.payment_method,
      hasScreenshot: !!validatedData.screenshot,
      timestamp: new Date().toISOString()
    });

    // TODO: Отправить уведомление администратору
    // await sendAdminNotification(data);

    return NextResponse.json({
      success: true,
      message: 'Заявку успішно надіслано! Ми зв\'яжемося з вами найближчим часом.',
      requestId: data.id
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

    logger.error('Unexpected error in subscription API', { error });
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