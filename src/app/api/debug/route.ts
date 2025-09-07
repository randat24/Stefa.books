import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Проверяем переменные окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const envCheck = {
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      supabaseUrlValue: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT_SET',
      supabaseKeyValue: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT_SET'
    };

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        envCheck
      });
    }

    // Создаем клиент и тестируем подключение
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Простой тест подключения
    const { data: testData, error: testError } = await supabase
      .from('books')
      .select('id, title')
      .limit(1);

    return NextResponse.json({
      success: true,
      envCheck,
      testConnection: {
        success: !testError,
        error: testError?.message || null,
        dataCount: testData?.length || 0,
        sampleData: testData?.[0] || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
