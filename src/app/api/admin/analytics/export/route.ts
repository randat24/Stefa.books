import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/app/admin/data';
import { logger } from '@/lib/logger';

// ============================================================================
// ЕКСПОРТ АНАЛІТИЧНИХ ДАНИХ
// ============================================================================

/**
 * GET /api/admin/analytics/export
 * Експорт аналітичних даних у форматі CSV
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

    const analyticsData = await getDashboardStats();
    
    // Форматування даних для експорту
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBooks: analyticsData.totalBooks,
        availableBooks: analyticsData.availableBooks,
        activeUsers: analyticsData.activeUsers,
        totalRevenue: analyticsData.totalRevenue,
        totalBooksCost: analyticsData.totalBooksCost
      }
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    logger.error('Error exporting analytics data', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/analytics/export
 * Експорт аналітичних даних у вказаному форматі
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Перевірка авторизації (в реальному застосунку потрібно реалізувати правильну перевірку)
    // const user = await getCurrentUser();
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { format = 'json' } = await request.json();
    
    const analyticsData = await getDashboardStats();
    
    // В залежності від формату повертаємо відповідні дані
    switch (format.toLowerCase()) {
      case 'csv':
        // Для CSV потрібно зробити спеціальне форматування
        return NextResponse.json({
          success: true,
          data: formatAsCSV(analyticsData),
          format: 'csv'
        });
      
      case 'json':
      default:
        return NextResponse.json({
          success: true,
          data: analyticsData,
          format: 'json'
        });
    }
  } catch (error) {
    logger.error('Error exporting analytics data', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// ДОПОМОЖНІ ФУНКЦІЇ
// ============================================================================

function formatAsCSV(data: any): string {
  // Просте форматування для прикладу
  // В реальному застосунку потрібно реалізувати повне CSV форматування
  return JSON.stringify(data, null, 2);
}