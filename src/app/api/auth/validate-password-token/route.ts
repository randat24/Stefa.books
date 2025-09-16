import { NextRequest, NextResponse } from 'next/server';
import { PasswordService } from '@/lib/auth/password-service';
import { logger } from '@/lib/logger';

/**
 * API для валидации токена установки пароля
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Токен обов\'язковий' },
        { status: 400 }
      );
    }

    // Проверяем токен
    const tokenData = PasswordService.verifyPasswordSetupToken(token);

    if (!tokenData) {
      return NextResponse.json({
        valid: false,
        error: 'Недійсний або прострочений токен'
      });
    }

    logger.info('Password setup token validated', {
      email: tokenData.email,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      valid: true,
      email: tokenData.email
    });

  } catch (error) {
    logger.error('Token validation error', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { valid: false, error: 'Помилка при перевірці токена' },
      { status: 500 }
    );
  }
}