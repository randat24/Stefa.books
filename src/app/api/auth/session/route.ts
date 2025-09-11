import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

// ============================================================================
// AUTH SESSION API
// ============================================================================

/**
 * GET /api/auth/session - Get current user session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    logger.info('Auth session: User session retrieved', { 
      userId: session.user.id,
      email: session.user.email 
    });

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at
      }
    });

  } catch (error) {
    logger.error('Auth session: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
