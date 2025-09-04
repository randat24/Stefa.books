import { NextResponse } from 'next/server';
import { getAdminDashboardData } from '@/app/admin/data';
import { logger } from '@/lib/logger';

// ============================================================================
// АДМІНІСТРАТИВНИЙ API ДЛЯ АНАЛІТИКИ
// ============================================================================

/**
 * GET /api/admin/analytics
 * Отримати аналітичні дані для адмін-панелі
 */
export async function GET() {
  try {
    // Перевірка авторизації (в реальному застосунку потрібно реалізувати правильну перевірку)
    // const user = await getCurrentUser();
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const analyticsData = await getAdminDashboardData();
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    logger.error('Error fetching analytics data', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// ТИПИ ДЛЯ API
// ============================================================================

export interface AnalyticsApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}