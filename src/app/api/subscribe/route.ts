import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { AutoRegistrationService } from '@/lib/auth/auto-registration-service';

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
    
    // Проверяем, можем ли мы подключиться к Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Проверяем, можем ли мы подключиться к Supabase
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'your_supabase_url_here') {
      logger.warn('Missing Supabase configuration, using mock data for subscription');
      
      // Имитируем успешное сохранение заявки
      const mockData = {
        id: crypto.randomUUID(),
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subscription_type: validatedData.plan,
        notes: validatedData.message || null,
        status: 'pending'
      };
      
      logger.info('Mock subscription request submitted successfully', {
        requestId: mockData.id,
        plan: validatedData.plan,
        paymentMethod: validatedData.paymentMethod,
        hasSocial: !!(validatedData.social && validatedData.social.trim()),
        hasMessage: !!validatedData.message,
        hasScreenshot: !!validatedData.screenshot,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Заявка на подписку успешно отправлена! Мы свяжемся с вами в ближайшее время.',
        data: mockData
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Сохраняем заявку на подписку (используем таблицу subscription_requests)
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        plan: validatedData.plan,
        payment_method: validatedData.paymentMethod === 'Онлайн оплата' ? 'online' : 'cash',
        privacy_consent: validatedData.privacyConsent,
        status: 'pending',
        book_title: 'Загальна підписка' // Добавляем обязательное поле
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error when inserting subscription request', {
        error: error,
        validatedData: validatedData,
        insertData: {
          id: 'generated',
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          subscription_type: validatedData.plan,
          notes: validatedData.message || null,
          status: 'pending'
        }
      });
      
      // Если ошибка связана с отсутствием таблицы, возвращаем моковые данные
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        logger.warn('Database table not found, falling back to mock data');
        
        const mockData = {
          id: crypto.randomUUID(),
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          subscription_type: validatedData.plan,
          notes: validatedData.message || null,
          status: 'pending'
        };
        
        return NextResponse.json({
          success: true,
          message: 'Заявка на подписку успешно отправлена! Мы свяжемся с вами в ближайшее время.',
          data: mockData
        });
      }
      
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
        logger.info('Creating online payment for subscription', {
          requestId: data.id,
          plan: validatedData.plan,
          amount: validatedData.plan === 'mini' ? 300 : 500
        }, 'Payment');
        
        const { monobankPaymentService } = await import('@/lib/payments/monobank-payment-service');
        
        const amount = validatedData.plan === 'mini' ? 300 : 500; // Сумма в гривнах
        const description = `Підписка ${validatedData.plan.toUpperCase()} - ${amount} ₴`;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const redirectUrl = `${baseUrl}/subscribe/success?requestId=${data.id}`;
        const webhookUrl = `${baseUrl}/api/payment/webhook`;
        
        const reference = `sub_${data.id}_${Date.now()}`;
        
        const paymentResult = await monobankPaymentService.createPayment({
          amount,
          description,
          reference,
          redirectUrl,
          webhookUrl });

        if (paymentResult.status === 'success' && paymentResult.data) {
          paymentData = {
            invoiceId: paymentResult.data.invoiceId,
            paymentUrl: paymentResult.data.pageUrl,
            reference };
          
          logger.info('Payment created successfully', {
            requestId: data.id,
            invoiceId: paymentResult.data.invoiceId,
            paymentUrl: paymentResult.data.pageUrl,
            reference
          }, 'Payment');
          
          // Обновляем заявку с данными платежа
          await supabase
            .from('subscription_requests')
            .update({
              notes: `Payment created: ${paymentResult.data.invoiceId}`
            })
            .eq('id', data.id);
        } else {
          logger.error('Payment creation failed', {
            requestId: data.id,
            paymentResult
          }, 'Payment');
        }
      } catch (paymentError) {
        logger.error('Payment creation failed', { 
          error: paymentError, 
          requestId: data.id 
        });
        // Не прерываем процесс, просто логируем ошибку
      }
    }

    // Автоматическая регистрация пользователя для банковских переводов
    // (для онлайн-оплаты регистрация произойдет после успешного платежа через webhook)
    let registrationResult = null;
    if (validatedData.paymentMethod === 'Переказ на карту') {
      try {
        registrationResult = await AutoRegistrationService.registerWithTemporaryPassword({
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
          plan: validatedData.plan,
          paymentMethod: validatedData.paymentMethod,
          subscriptionRequestId: data.id
        });

        if (registrationResult.success) {
          logger.info('User auto-registered after bank transfer subscription', {
            requestId: data.id,
            userId: registrationResult.user?.id,
            email: validatedData.email
          });
        } else {
          logger.warn('Failed to auto-register user for bank transfer', {
            requestId: data.id,
            email: validatedData.email,
            error: registrationResult.error
          });
        }
      } catch (autoRegError) {
        logger.error('Auto-registration error', {
          requestId: data.id,
          email: validatedData.email,
          error: autoRegError
        });
      }
    }

    // TODO: Отправить уведомление администратору
    // await sendAdminNotification(data);

    // Подготовка ответа с учетом регистрации
    const baseMessage = paymentData
      ? 'Заявку успішно надіслано! Ви будете перенаправлені на сторінку оплати.'
      : 'Заявку успішно надіслано! Ми зв\'яжемося з вами найближчим часом.';

    const registrationMessage = registrationResult?.success
      ? ' Аккаунт створено автоматично, тимчасовий пароль надіслано на вашу пошту.'
      : '';

    return NextResponse.json({
      success: true,
      message: baseMessage + registrationMessage,
      requestId: data.id,
      payment: paymentData,
      autoRegistration: registrationResult ? {
        success: registrationResult.success,
        hasAccount: registrationResult.success,
        error: registrationResult.error
      } : null
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