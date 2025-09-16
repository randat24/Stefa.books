import { NextRequest, NextResponse } from 'next/server';
import { AutoRegistrationService } from '@/lib/auth/auto-registration-service';
import { logger } from '@/lib/logger';

/**
 * API для установки пароля по токену
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Токен і пароль обов\'язкові' },
        { status: 400 }
      );
    }

    // Завершаем регистрацию пользователя с установкой пароля
    const result = await AutoRegistrationService.completePasswordSetup(token, password);

    if (result.success) {
      logger.info('Password setup completed successfully', {
        userId: result.user?.id,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Пароль успішно встановлено',
        user: result.user
      });
    } else {
      logger.warn('Password setup failed', {
        error: result.error,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('Password setup API error', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { success: false, error: 'Помилка при встановленні паролю' },
      { status: 500 }
    );
  }
}