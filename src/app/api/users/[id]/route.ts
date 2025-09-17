/**
 * API для получения данных пользователя
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID користувача обов\'язковий' },
        { status: 400 }
      );
    }

    logger.info('Получаем данные пользователя:', id);

    // Получаем пользователя из базы данных
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json(
          { error: 'Користувач не знайдений' },
          { status: 404 }
        );
      }

      logger.error('Ошибка получения пользователя:', error);
      return NextResponse.json(
        { error: 'Помилка отримання даних користувача' },
        { status: 500 }
      );
    }

    logger.info('Пользователь найден:', user.email);

    // Возвращаем данные пользователя (без чувствительной информации)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      subscription_type: user.subscription_type,
      subscription_start: user.subscription_start,
      subscription_end: user.subscription_end,
      status: user.status,
      created_at: user.created_at
    });

  } catch (error) {
    logger.error('Unexpected error in user API:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID користувача обов\'язковий' },
        { status: 400 }
      );
    }

    logger.info('Обновляем данные пользователя:', id);

    // Обновляем только разрешенные поля
    const allowedFields = ['name', 'phone', 'address'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Ошибка обновления пользователя:', error);
      return NextResponse.json(
        { error: 'Помилка оновлення даних користувача' },
        { status: 500 }
      );
    }

    logger.info('Пользователь обновлен:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        subscription_type: user.subscription_type,
        subscription_start: user.subscription_start,
        subscription_end: user.subscription_end,
        status: user.status,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    logger.error('Unexpected error updating user:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}