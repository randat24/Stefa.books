import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Тестируем подключение к базе данных
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('id, email, created_at')
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        code: error.code || 'UNKNOWN'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      records: data?.length || 0,
      sample: data
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}