import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ============================================================================
// API ДЛЯ ВХОДУ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================================

const loginSchema = z.object({
  email: z.string().email('Неправильний формат email'),
  password: z.string().min(1, 'Пароль обов\'язковий')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validatedData = loginSchema.parse(body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Используем anon ключ для аутентификации
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // Используем service ключ для работы с профилями
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    console.log('User login attempt', { email: validatedData.email });

    // Попытка входа
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    });

    if (authError) {
      console.error('Login failed', { error: authError.message });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неправильний email або пароль' 
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      console.error('No user data returned');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка аутентифікації' 
        },
        { status: 401 }
      );
    }

    // Получение профиля пользователя по email (используем сервисный ключ)
    console.log('Fetching user profile', { email: authData.user.email });
    const { data: profiles, error: profileError } = await supabaseService
      .from('users')
      .select('*')
      .eq('email', authData.user.email);
    
    let profile = profiles?.[0] || null;

    console.log('Profile fetch result', { 
      profile: profile, 
      error: profileError,
      errorCode: profileError?.code 
    });

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Failed to fetch user profile', { error: profileError });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Помилка отримання профілю користувача' 
        },
        { status: 500 }
      );
    }

    // Если профиль не найден, создаем новый
    if (!profile) {
      console.log('Creating new user profile', { email: authData.user.email });
      
      // Получаем максимальный ID для генерации следующего (используем сервисный ключ)
      const { data: maxIdData } = await supabaseService
        .from('users')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      const nextId = (maxIdData && maxIdData.length > 0 ? maxIdData[0].id : 0) + 1;
      
      const { data: newProfile, error: createError } = await supabaseService
        .from('users')
        .insert({
          id: nextId,
          email: authData.user.email,
          name: authData.user.user_metadata?.full_name || authData.user.email,
          role: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua' || authData.user.user_metadata?.role === 'admin') ? 'admin' : 'user',
          subscription_type: (authData.user.email === 'admin@stefa-books.com.ua' || authData.user.email === 'admin@stefabooks.com.ua' || authData.user.user_metadata?.role === 'admin') ? 'premium' : 'mini',
          status: 'active'
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Failed to create user profile', { error: createError });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Помилка створення профілю користувача' 
          },
          { status: 500 }
        );
      } else {
        profile = newProfile;
      }
    }

    console.log('User logged in successfully', { userId: authData.user.id });

    return NextResponse.json({
      success: true,
      message: 'Успішний вхід',
      user: authData.user,
      profile: profile || null,
      session: authData.session
    });

  } catch (error: any) {
    console.error('Login API error', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.errors[0]?.message || 'Неправильні дані' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутрішня помилка сервера' 
      },
      { status: 500 }
    );
  }
}