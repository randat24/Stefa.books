import { NextRequest, NextResponse } from 'next/server';
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

    // Обновляем статус заявки
    const { error: updateError } = await supabase
      .from('subscription_requests')
      .update({
        status: body.status === 'success' ? 'approved' : 'rejected',
        admin_notes: `Payment ${body.status}: ${body.invoiceId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', reference.replace('sub_', '').split('_')[0]);

    if (updateError) {
      logger.error('Failed to update subscription request status', { 
        error: updateError, 
        reference, 
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