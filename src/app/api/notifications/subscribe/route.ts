import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription data is required' },
        { status: 400 }
      );
    }

    // В реальном проекте здесь бы сохранялась подписка в базу данных
    // Пока что просто логируем
    logger.info('New push subscription received', {
      endpoint: subscription.endpoint,
      keys: subscription.keys
    });

    // TODO: Сохранить подписку в Supabase
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .insert({
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     user_id: user.id, // если пользователь авторизован
    //     created_at: new Date().toISOString()
    //   });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    });

  } catch (error) {
    logger.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
