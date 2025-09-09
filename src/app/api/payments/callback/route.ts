import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { logger } from '@/lib/logger';

/**
 * POST /api/payments/callback - Handle payment provider callback
 */
export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would verify the callback signature
    // to ensure it's from the payment provider
    
    const callbackData = await request.json();
    
    const response = await paymentService.processPaymentCallback(callbackData);
    
    if (!response.success) {
      logger.error('Payment callback processing failed', { error: response.error });
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });
  } catch (error) {
    logger.error('Payment callback API error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}