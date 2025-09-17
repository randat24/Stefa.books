import { NextResponse } from 'next/server';

export async function GET() {
  // Этот endpoint поможет диагностировать проблему с переменными окружения
  const token = process.env.MONOBANK_TOKEN;
  const nodeEnv = process.env.NODE_ENV;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 8) + '...' : 'none',
    nodeEnv,
    siteUrl,
    timestamp: new Date().toISOString()
  });
}