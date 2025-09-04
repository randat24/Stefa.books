import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/auth/session';

// ============================================================================
// PAYMENT API ROUTES
// ============================================================================

/**
 * GET /api/payments/plans - Get available subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'plans':
        // Get available subscription plans
        const plans = await paymentService.getSubscriptionPlans();
        
        return NextResponse.json({
          success: true,
          data: plans
        });

      case 'subscriptions':
        // Get user subscriptions
        const session = await getServerSession();
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const subscriptions = await paymentService.getUserSubscriptions(session.user.id);
        
        return NextResponse.json({
          success: true,
          data: subscriptions
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Payment API: GET error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments - Create payment or subscription
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

    const { action, planId, amount, currency, description, orderId } = await request.json();

    switch (action) {
      case 'create-payment':
        // Create a one-time payment
        if (!amount || !currency || !description || !orderId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const paymentResponse = await paymentService.createPayment({
          amount,
          currency,
          description,
          orderId,
          userId: session.user.id,
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

      case 'create-subscription':
        // Create a subscription
        if (!planId) {
          return NextResponse.json(
            { success: false, error: 'Plan ID is required' },
            { status: 400 }
          );
        }

        const subscriptionResponse = await paymentService.createSubscription(
          session.user.id,
          planId
        );

        if (!subscriptionResponse.success) {
          return NextResponse.json(
            { success: false, error: subscriptionResponse.error },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: subscriptionResponse.subscription
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Payment API: POST error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payments - Update subscription
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, subscriptionId } = await request.json();

    switch (action) {
      case 'cancel-subscription':
        // Cancel a subscription
        if (!subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Subscription ID is required' },
            { status: 400 }
          );
        }

        const cancelResponse = await paymentService.cancelSubscription(subscriptionId);

        if (!cancelResponse.success) {
          return NextResponse.json(
            { success: false, error: cancelResponse.error },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Payment API: PUT error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

