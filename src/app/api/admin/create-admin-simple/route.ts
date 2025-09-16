import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    // Создаем пользователя напрямую в таблице users (обход auth.users)
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: email,
        name: name,
        role: 'admin',
        phone: '+38 (073) 408 56 60',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Администратор системы',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: `Ошибка создания пользователя: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Администратор создан успешно',
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        password: password // Возвращаем пароль для отображения
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
