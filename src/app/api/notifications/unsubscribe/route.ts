import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // В реальном проекте здесь бы удалялась подписка из базы данных
    logger.info('Push subscription unsubscribed', { endpoint });

    // TODO: Удалить подписку из Supabase
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .delete()
    //   .eq('endpoint', endpoint);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    });

  } catch (error) {
    logger.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
