import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const subscriptionSchema = z.object({
  plan_id: z.enum(['mini', 'maxi', 'premium']),
  customer_email: z.string().email('Невірний email')
});

const SUBSCRIPTION_PLANS = {
  mini: {
    name: 'Mini',
    price: 300,
    max_books: 1,
    features: ['1 книга з можливістю обміну', 'Самовивіз з точки', 'Підтримка 24/7', 'Мобільний додаток']
  },
  maxi: {
    name: 'Maxi',
    price: 500,
    max_books: 2,
    features: ['2 книги з можливістю обміну', 'Самовивіз з точки', 'Пріоритетна підтримка', 'Ексклюзивні книги', 'Персональний куратор']
  },
  premium: {
    name: 'Premium',
    price: 1500,
    max_books: 2,
    features: ['2 книги з можливістю обміну', 'Самовивіз з точки', 'VIP підтримка', 'Всі категорії книг', 'Сімейний кабінет', 'Персональні рекомендації', 'Економія 500₴ за півроку']
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = subscriptionSchema.parse(body);
    
    const plan = SUBSCRIPTION_PLANS[validatedData.plan_id];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Невірний план підписки' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, subscription_type, status')
      .eq('email', validatedData.customer_email)
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Error checking existing subscription:', { error: checkError, email: validatedData.customer_email });
      return NextResponse.json(
        { success: false, error: 'Помилка при перевірці підписки' },
        { status: 500 }
      );
    }

    if (existingUser && existingUser.subscription_type) {
      return NextResponse.json(
        { success: false, error: 'У вас вже є активна підписка' },
        { status: 400 }
      );
    }

    // Calculate subscription dates
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Update user with subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('users')
      .update({
        subscription_type: validatedData.plan_id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', validatedData.customer_email)
      .select()
      .single();

    if (subscriptionError) {
      logger.error('Error creating subscription:', { error: subscriptionError, data: validatedData });
      return NextResponse.json(
        { success: false, error: 'Помилка при створенні підписки' },
        { status: 500 }
      );
    }

    // Log successful subscription creation
    logger.info('Subscription created successfully:', {
      subscription_id: subscription.id,
      customer_email: validatedData.customer_email,
      plan_id: validatedData.plan_id,
      price: plan.price
    });

    return NextResponse.json({
      success: true,
      subscription_id: subscription.id,
      message: 'Підписка успішно створена'
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

    logger.error('Unexpected error in subscription API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');
    
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Email обов\'язковий' },
        { status: 400 }
      );
    }

    // Get active subscription for customer
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching subscription:', { error, customerEmail });
      return NextResponse.json(
        { success: false, error: 'Помилка при отриманні підписки' },
        { status: 500 }
      );
    }

    // Debug: log user data
    logger.info('User data for subscription:', { 
      user: user, 
      hasSubscriptionType: !!user?.subscription_type,
      subscriptionType: user?.subscription_type 
    });

    return NextResponse.json({
      success: true,
      subscription: user && user.subscription_type ? {
        plan_name: user.subscription_type,
        end_date: user.updated_at,
        status: user.status
      } : null
    });

  } catch (error) {
    logger.error('Unexpected error in subscription GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription_id, action } = body;
    
    if (!subscription_id || !action) {
      return NextResponse.json(
        { success: false, error: 'subscription_id та action обов\'язкові' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case 'activate':
        updateData = { status: 'active' };
        break;
      case 'cancel':
        updateData = { status: 'cancelled' };
        break;
      case 'pause':
        updateData = { status: 'paused' };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Невірна дія' },
          { status: 400 }
        );
    }

    const { data: subscription, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', subscription_id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating subscription:', { error, subscription_id, action });
      return NextResponse.json(
        { success: false, error: 'Помилка при оновленні підписки' },
        { status: 500 }
      );
    }

    logger.info('Subscription updated successfully:', {
      subscription_id,
      action,
      new_status: updateData.status
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Підписка успішно оновлена'
    });

  } catch (error) {
    logger.error('Unexpected error in subscription PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
