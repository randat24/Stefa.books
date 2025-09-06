import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Получаем токен из заголовков или cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не авторизовано' 
        },
        { status: 401 }
      );
    }

    // Получаем пользователя по токену
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      logger.error('Failed to get user', { error: userError }, 'Auth');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не вдалося отримати дані користувача' 
        },
        { status: 401 }
      );
    }

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.warn('Failed to fetch user profile', { error: profileError }, 'Auth');
      // Не блокируем, если профиль не найден
    }

    logger.info('User data retrieved', { userId: user.id }, 'Auth');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        phone: user.user_metadata?.phone,
        emailConfirmed: user.email_confirmed_at ? true : false,
        createdAt: user.created_at
      },
      profile: profile || null
    });

  } catch (error: any) {
    logger.error('Get user API error', { error }, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
