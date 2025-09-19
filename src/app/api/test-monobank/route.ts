/**
 * Тестовый API для проверки работы Monobank
 */

import { NextRequest, NextResponse } from 'next/server';
import { monobankService } from '@/lib/services/monobank';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Тестируем создание реального платежа Monobank');

    const body = await request.json();
    const { amount = 1, description = 'Тест реального платежа' } = body;

    // Создаем минимальный тестовый платеж (1 гривна)
    const payment = await monobankService.createPayment({
      amount: amount, // Тестовая сумма
      description: description,
      reference: `test-${Date.now()}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/test-success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payments/monobank/webhook`
    });

    logger.info('Результат создания платежа:', payment);

    return NextResponse.json({
      success: true,
      message: 'Тест Monobank API выполнен',
      payment: payment,
      mode: 'РЕАЛЬНЫЙ РЕЖИМ - НАСТОЯЩИЕ ДЕНЬГИ!',
      warning: 'Это реальный платеж, будьте осторожны!'
    });

  } catch (error) {
    logger.error('Ошибка теста Monobank:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      details: 'Проверьте MONOBANK_TOKEN и настройки API'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Проверяем информацию о клиенте (личный API)
    const clientInfo = await monobankService.getClientInfo();

    return NextResponse.json({
      success: true,
      message: 'Проверка настроек Monobank',
      client_info: clientInfo,
      mode: 'РЕАЛЬНЫЙ РЕЖИМ',
      api_url: 'https://api.monobank.ua/api/merchant',
      token_configured: !!process.env.MONOBANK_TOKEN
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка проверки настроек',
      token_configured: !!process.env.MONOBANK_TOKEN
    }, { status: 500 });
  }
}