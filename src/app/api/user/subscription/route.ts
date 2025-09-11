import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { paymentService } from '@/lib/payments/payment-service';

// ============================================================================
// USER SUBSCRIPTION API
// ============================================================================

/**
 * GET /api/user/subscription - Get user subscription info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user subscription data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_type, subscription_start, subscription_end, status')
      .eq('id', userId)
      .single();

    if (userError) {
      logger.error('User subscription: Error fetching user data', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscription data' },
        { status: 500 }
      );
    }

    // Get subscription plans
    const plans = await paymentService.getSubscriptionPlans();

    // Calculate subscription status
    const now = new Date();
    const endDate = userData.subscription_end ? new Date(userData.subscription_end) : null;
    const isExpired = endDate ? now > endDate : true;
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const subscription = {
      plan: userData.subscription_type,
      status: isExpired ? 'expired' : 'active',
      start_date: userData.subscription_start,
      end_date: userData.subscription_end,
      days_left: Math.max(0, daysLeft),
      is_expired: isExpired,
      can_renew: true,
      next_billing_date: userData.subscription_end
    };

    logger.info('User subscription: Data fetched successfully', { userId });

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        availablePlans: plans,
        userStatus: userData.status
      }
    });

  } catch (error) {
    logger.error('User subscription: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/subscription - Update subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { action, planId, paymentMethod } = await request.json();

    switch (action) {
      case 'renew':
        // Renew subscription
        if (!planId) {
          return NextResponse.json(
            { success: false, error: 'Plan ID is required' },
            { status: 400 }
          );
        }

        // Create payment for renewal
        const paymentResponse = await paymentService.createPayment({
          amount: getPlanPrice(planId),
          currency: 'UAH',
          description: `Продовження підписки ${planId}`,
          orderId: `renew_${Date.now()}`,
          userId,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
          phone: session.user.user_metadata?.phone
        });

        if (!paymentResponse.success) {
          return NextResponse.json(
            { success: false, error: paymentResponse.error },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            paymentUrl: paymentResponse.paymentUrl,
            paymentId: paymentResponse.paymentId
          }
        });

      case 'cancel':
        // Cancel subscription (disable auto-renewal)
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          logger.error('User subscription: Error cancelling subscription', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to cancel subscription' },
            { status: 500 }
          );
        }

        logger.info('User subscription: Subscription cancelled', { userId });

        return NextResponse.json({
          success: true,
          message: 'Підписку скасовано. Ви можете продовжити її в будь-який час.'
        });

      case 'upgrade':
        // Upgrade subscription
        if (!planId) {
          return NextResponse.json(
            { success: false, error: 'Plan ID is required' },
            { status: 400 }
          );
        }

        // Create payment for upgrade
        const upgradeResponse = await paymentService.createPayment({
          amount: getPlanPrice(planId),
          currency: 'UAH',
          description: `Оновлення підписки до ${planId}`,
          orderId: `upgrade_${Date.now()}`,
          userId,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
          phone: session.user.user_metadata?.phone
        });

        if (!upgradeResponse.success) {
          return NextResponse.json(
            { success: false, error: upgradeResponse.error },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            paymentUrl: upgradeResponse.paymentUrl,
            paymentId: upgradeResponse.paymentId
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('User subscription: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get plan price
function getPlanPrice(planId: string): number {
  const prices: Record<string, number> = {
    'basic_monthly': 299,
    'premium_monthly': 499,
    'premium_yearly': 4990
  };
  return prices[planId] || 0;
}
