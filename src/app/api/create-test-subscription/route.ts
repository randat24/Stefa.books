import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, name, plan } = await request.json();

    if (!email || !name || !plan) {
      return NextResponse.json(
        { success: false, error: 'email, name, and plan are required' },
        { status: 400 }
      );
    }

    // Создаем Supabase клиент с service role key для обхода RLS
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

    // Создаем реальную заявку в базе данных
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert({
        name,
        email,
        phone: '+380991234567',
        plan,
        payment_method: 'online',
        privacy_consent: true,
        status: 'pending',
        book_title: 'Test webhook subscription'
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create test subscription', {
        error: error.message,
        code: error.code,
        details: error.details
      });

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.info('Test subscription created successfully', {
      id: data.id,
      email,
      name,
      plan
    });

    return NextResponse.json({
      success: true,
      message: 'Test subscription created',
      data
    });

  } catch (error) {
    logger.error('Unexpected error creating test subscription', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}