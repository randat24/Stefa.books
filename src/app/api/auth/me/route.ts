import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1) Пытаемся получить пользователя из cookie-сессии (SSR куки)
    let { data: { user }, error: userError } = await supabase.auth.getUser();

    // 2) Fallback: если не удалось — пробуем из переданного Bearer токена
    if ((!user || userError) && request.headers.get('authorization')?.startsWith('Bearer ')) {
      const token = request.headers.get('authorization')!.substring(7);
      const res = await supabase.auth.getUser(token);
      user = res.data.user;
      userError = res.error as any;
    }

    if (userError || !user) {
      if (userError?.message === 'Invalid JWT') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Токен истек или недействителен' 
          },
          { status: 401 }
        );
      }
      
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
    // Сначала пробуем найти в таблице users
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);

    let profile = profiles?.[0] || null;
    let hasProfileError = !!profileError;

    // Если не найдено, пробуем в user_profiles
    if (!profile) {
        const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id);
      
      if (profileData && profileData.length > 0) {
        // Конвертируем user_profiles в формат users (все обязательные поля)
        const profileDataItem = profileData[0];
        profile = {
          id: user.id,
          email: profileDataItem.email,
          name: (`${profileDataItem.first_name || ''} ${profileDataItem.last_name || ''}`.trim()) || user.email || 'Користувач',
          phone: profileDataItem.phone || null,
          address: null,
          notes: null,
          role: 'user',
          status: 'active',
          subscription_type: 'mini',
          subscription_start: null,
          subscription_end: null,
          created_at: profileDataItem.created_at,
          updated_at: profileDataItem.updated_at
        } as any;
        hasProfileError = false;
      }
    }

    if (hasProfileError) {
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
    logger.error('Get user API error', error, 'Auth');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}
