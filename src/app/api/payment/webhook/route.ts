import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature') || '';
    
    // Валидируем webhook
    if (!monobankService.validateWebhook(body, signature)) {
      logger.warn('Invalid Monobank webhook signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Обрабатываем webhook
    const result = await monobankService.processWebhook(body);
    
    if (!result.success) {
      logger.error('Webhook processing failed', { body, result });
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Обновляем статус заявки в базе данных
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase environment variables in webhook');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Ищем заявку по reference
    const reference = body.reference;
    if (!reference) {
      logger.warn('No reference in webhook data', { body });
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
    }

    // Извлекаем ID пользователя из reference
    const userId = reference.replace('sub_', '').split('_')[0];

    if (body.status === 'success') {
      // Активируем пользователя при успешной оплате
      await activateUserAfterPayment(userId, supabase);
    }

    // Обновляем статус заявки в таблице users
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: body.status === 'success' ? 'active' : 'rejected',
        notes: `Payment ${body.status}: ${body.invoiceId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Failed to update user status', {
        error: updateError,
        reference,
        userId,
        status: body.status
      });
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    logger.info('Webhook processed successfully', {
      reference,
      status: body.status,
      invoiceId: body.invoiceId
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Webhook processing error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Активирует пользователя после успешной оплаты
 * Создает аккаунт в Supabase Auth и устанавливает метаданные подписки
 */
async function activateUserAfterPayment(userId: string, supabase: any) {
  try {
    // Получаем данные пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email, phone, subscription_type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logger.error('Failed to fetch user data for activation', {
        userId,
        error: userError
      });
      return;
    }

    // Создаем аккаунт в Supabase Auth с service role
    const supabaseServiceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseServiceUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Генерируем временный пароль
    const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Создаем пользователя в auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true, // Автоматически подтверждаем email
      user_metadata: {
        name: user.name,
        phone: user.phone,
        subscription_type: user.subscription_type,
        subscription_status: 'active',
        activated_at: new Date().toISOString(),
        max_concurrent_rentals: user.subscription_type === 'mini' ? 1 : 2,
        created_via: 'payment'
      }
    });

    if (authError) {
      logger.error('Failed to create auth user', {
        userId,
        email: user.email,
        error: authError
      });
      return;
    }

    // Обновляем запись пользователя с auth_id
    const { error: linkError } = await supabase
      .from('users')
      .update({
        auth_id: authUser.user.id,
        status: 'active',
        subscription_status: 'active',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (linkError) {
      logger.error('Failed to link user with auth record', {
        userId,
        authId: authUser.user.id,
        error: linkError
      });
    }

    logger.info('User activated successfully after payment', {
      userId,
      authId: authUser.user.id,
      email: user.email,
      subscriptionType: user.subscription_type,
      maxRentals: user.subscription_type === 'mini' ? 1 : 2
    });

    // TODO: Отправить email с инструкциями по входу
    // await sendActivationEmail(user.email, user.name, tempPassword);

  } catch (error) {
    logger.error('Error during user activation', { userId, error });
  }
}