import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Создаем клиент с service_role для создания пользователей
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password и name обязательны' },
        { status: 400 }
      );
    }

    // Создаем пользователя в auth.users с service_role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: `Ошибка создания пользователя: ${authError.message}` },
        { status: 500 }
      );
    }

    // Создаем профиль в таблице users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: 'admin',
        phone: '+38 (063) 856-54-14',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Администратор системы',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { success: false, error: `Ошибка создания профиля: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Администратор создан успешно',
      data: {
        id: authData.user.id,
        email: email,
        name: name,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
