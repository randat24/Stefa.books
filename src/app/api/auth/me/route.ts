import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// API ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Токен авторизації відсутній' 
        },
        { status: 401 }
      );
    }

    const token = authorization.substring(7); // Remove "Bearer " prefix

    // Получаем пользователя по токену
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

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
        // Конвертируем user_profiles в формат users
        const profileDataItem = profileData[0];
        profile = {
          id: user.id,
          name: `${profileDataItem.first_name || ''} ${profileDataItem.last_name || ''}`.trim() || user.email,
          email: profileDataItem.email,
          phone: profileDataItem.phone || null,
          role: 'user',
          subscription_type: 'mini',
          status: 'active',
          created_at: profileDataItem.created_at,
          updated_at: profileDataItem.updated_at
        };
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
