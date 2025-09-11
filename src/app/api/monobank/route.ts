import { NextRequest, NextResponse } from 'next/server';
import { monobankService } from '@/lib/payments/monobank-service';
import { logger } from '@/lib/logger';

// ============================================================================
// MONOBANK API ROUTES
// ============================================================================

/**
 * GET /api/monobank - Get Monobank data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'currency-rates':
        // Get currency rates
        const rates = await monobankService.getCurrencyRates();
        return NextResponse.json({
          success: true,
          data: rates
        });

      case 'client-info':
        // Get client information (requires token)
        const clientInfo = await monobankService.getClientInfo();
        return NextResponse.json({
          success: true,
          data: clientInfo
        });

      case 'usd-rate':
        // Get USD to UAH rate
        const usdRate = await monobankService.getUahToUsdRate();
        return NextResponse.json({
          success: true,
          data: { rate: usdRate }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Monobank API: GET error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monobank - Monobank operations
 */
export async function POST(request: NextRequest) {
  try {
    const { action, account, amount, description, timeWindowHours } = await request.json();

    switch (action) {
      case 'check-payment':
        // Check if payment was received
        if (!account || !amount) {
          return NextResponse.json(
            { success: false, error: 'Account and amount are required' },
            { status: 400 }
          );
        }

        const paymentCheck = await monobankService.checkPaymentReceived(
          account,
          amount,
          description,
          timeWindowHours
        );

        return NextResponse.json({
          success: true,
          data: paymentCheck
        });

      case 'set-webhook':
        // Set webhook URL
        const { webhookUrl } = await request.json();
        if (!webhookUrl) {
          return NextResponse.json(
            { success: false, error: 'Webhook URL is required' },
            { status: 400 }
          );
        }

        const webhookSet = await monobankService.setWebhook(webhookUrl);
        return NextResponse.json({
          success: webhookSet,
          message: webhookSet ? 'Webhook set successfully' : 'Failed to set webhook'
        });

      case 'convert-uah-to-usd':
        // Convert UAH to USD
        const { uahAmount } = await request.json();
        if (!uahAmount) {
          return NextResponse.json(
            { success: false, error: 'UAH amount is required' },
            { status: 400 }
          );
        }

        const usdAmount = await monobankService.convertUahToUsd(uahAmount);
        return NextResponse.json({
          success: true,
          data: { 
            uahAmount, 
            usdAmount: usdAmount ? Math.round(usdAmount * 100) / 100 : null 
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Monobank API: POST error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
