import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email та пароль обов\'язкові' },
        { status: 400 }
      );
    }

    // Аутентификация через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.error('Authentication failed', authError, 'Auth');
      return NextResponse.json(
        { error: 'Невірний email або пароль' },
        { status: 401 }
      );
    }

    // Получаем профиль из user_profiles (этот подход более надежный)
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    let profile = null;
    
    if (profileData) {
      // Конвертируем user_profiles в формат users
      profile = {
        id: authData.user.id,
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || authData.user.email,
        email: profileData.email,
        phone: profileData.phone || null,
        role: 'user',
        subscription_type: 'mini',
        status: 'active',
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };
    } else {
      // Создаем базовый профиль
      profile = {
        id: authData.user.id,
        name: authData.user.email,
        email: authData.user.email,
        phone: null,
        role: 'user',
        subscription_type: 'mini',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Создаем запись в user_profiles
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: '',
          last_name: '',
          phone: null
        });

      if (insertError) {
        logger.warn('Failed to create user profile', insertError, 'Auth');
      }
    }

    // Создаем сессию
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || '',
    });

    if (sessionError) {
      logger.error('Failed to set session', sessionError, 'Auth');
      return NextResponse.json(
        { error: 'Помилка створення сесії' },
        { status: 500 }
      );
    }

    logger.info('User logged in successfully', { userId: authData.user.id, email }, 'Auth');

    return NextResponse.json({
      success: true,
      user: profile,
      session: sessionData.session
    });

  } catch (error) {
    logger.error('Login API error', error, 'Auth');
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
