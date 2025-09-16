import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AutoRegistrationService } from '@/lib/auth/auto-registration-service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionRequestId } = await request.json();

    if (!subscriptionRequestId) {
      return NextResponse.json(
        { success: false, error: 'subscriptionRequestId обязателен' },
        { status: 400 }
      );
    }

    logger.info('Test webhook: Processing payment success', {
      subscriptionRequestId
    });

    // Создаем Supabase клиент с service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Получаем заявку на подписку
    const { data: subscriptionRequest, error: fetchError } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', subscriptionRequestId)
      .single();

    if (fetchError || !subscriptionRequest) {
      logger.error('Test webhook: Subscription request not found', {
        subscriptionRequestId,
        error: fetchError?.message
      });
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, что заявка еще не обработана
    if (subscriptionRequest.status === 'completed') {
      logger.info('Test webhook: Subscription request already processed', {
        subscriptionRequestId
      });
      return NextResponse.json({
        success: true,
        message: 'Заявка уже обработана'
      });
    }

    // Автоматически регистрируем пользователя
    const registrationResult = await AutoRegistrationService.registerWithTemporaryPassword({
      email: subscriptionRequest.email,
      name: subscriptionRequest.name,
      phone: subscriptionRequest.phone,
      plan: subscriptionRequest.plan as 'mini' | 'maxi',
      paymentMethod: 'online_test',
      subscriptionRequestId: subscriptionRequest.id
    });

    if (registrationResult.success) {
      logger.info('Test webhook: User registered successfully', {
        subscriptionRequestId,
        userId: registrationResult.user?.id,
        temporaryPassword: registrationResult.temporaryPassword
      });

      return NextResponse.json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          userId: registrationResult.user?.id,
          temporaryPassword: registrationResult.temporaryPassword,
          email: subscriptionRequest.email
        }
      });
    } else {
      logger.error('Test webhook: Registration failed', {
        subscriptionRequestId,
        error: registrationResult.error
      });

      return NextResponse.json(
        { success: false, error: registrationResult.error },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Test webhook: Unexpected error', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}