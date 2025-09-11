import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// AUTH LOGOUT API
// ============================================================================

/**
 * POST /api/auth/logout - Logout user
 */
export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Auth logout: Error signing out', error);
      return NextResponse.json(
        { success: false, error: 'Failed to logout' },
        { status: 500 }
      );
    }

    logger.info('Auth logout: User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Auth logout: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}