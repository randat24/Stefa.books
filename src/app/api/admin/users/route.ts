import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/auth/session';

// ============================================================================
// ADMIN USER MANAGEMENT API
// ============================================================================

/**
 * GET /api/admin/users - Get users with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (in a real implementation, you would check roles)
    // For now, we'll allow access to all authenticated users for testing
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const subscriptionType = searchParams.get('subscriptionType') || '';
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (subscriptionType) {
      query = query.eq('subscription_type', subscriptionType);
    }
    
    const { data, error, count } = await query;

    if (error) {
      logger.error('Admin users API: Failed to fetch users', { error });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        users: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Admin users API: GET error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (in a real implementation, you would check roles)
    // For now, we'll allow access to all authenticated users for testing
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password || 'TempPass123!', // In a real implementation, you would generate a secure password
      email_confirm: true,
      user_metadata: {
        name: body.name,
        phone: body.phone || null
      }
    });
    
    if (authError) {
      logger.error('Admin users API: Failed to create auth user', { error: authError });
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // Create user profile in database
    const { error: profileError } = await (supabase
      .from('users') as any)
      .insert({
        id: authData.user.id,
        email: body.email,
        name: `${body.first_name} ${body.last_name}`,
        phone: body.phone || null,
        subscription_type: body.subscription_type || 'mini',
        status: body.status || 'active',
        address: body.address || null,
        notes: body.notes || null
      });
    
    if (profileError) {
      logger.error('Admin users API: Failed to create user profile', { error: profileError });
      // Try to delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      );
    }
    
    logger.info('Admin users API: User created successfully', { userId: authData.user.id });
    
    return NextResponse.json({
      success: true,
      data: { userId: authData.user.id },
      message: 'User created successfully'
    });
    
  } catch (error) {
    logger.error('Admin users API: POST error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id] - Update a user
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (in a real implementation, you would check roles)
    // For now, we'll allow access to all authenticated users for testing
    
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Update user profile
    const { error } = await (supabase
      .from('users') as any)
      .update({
        name: body.name,
        phone: body.phone,
        subscription_type: body.subscription_type,
        status: body.status,
        address: body.address,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      logger.error('Admin users API: Failed to update user', { error, userId });
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    // Update user metadata in Supabase Auth if needed
    if (body.name || body.phone) {
      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.phone) updateData.phone = body.phone;
      
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: updateData
      });
    }
    
    logger.info('Admin users API: User updated successfully', { userId });
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    logger.error('Admin users API: PUT error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (in a real implementation, you would check roles)
    // For now, we'll allow access to all authenticated users for testing
    
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      logger.error('Admin users API: Failed to delete auth user', { error: authError, userId });
      return NextResponse.json(
        { success: false, error: 'Failed to delete user account' },
        { status: 500 }
      );
    }
    
    // Delete user profile from database
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      logger.error('Admin users API: Failed to delete user profile', { error: profileError, userId });
      return NextResponse.json(
        { success: false, error: 'Failed to delete user profile' },
        { status: 500 }
      );
    }
    
    logger.info('Admin users API: User deleted successfully', { userId });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    logger.error('Admin users API: DELETE error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}