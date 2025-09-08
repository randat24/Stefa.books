import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// ADMIN USER MANAGEMENT API
// ============================================================================

/**
 * GET /api/admin/users - Get users with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = authHeader?.replace('Bearer ', '') || 
      (cookieHeader?.includes('sb-access-token=') ? 
        cookieHeader.split('sb-access-token=')[1]?.split(';')[0] : null);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token and get user
    const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser(token);
    
    if (userAuthError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Check if user is admin by email or profile role
    const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || user.email === 'admin@stefa-books.com.ua';
    const isAdminByRole = profile?.role === 'admin';

    logger.info('Admin access check', { 
      userId: user.id, 
      email: user.email, 
      profileRole: profile?.role,
      isAdminByEmail,
      isAdminByRole
    });

    if (!isAdminByEmail && !isAdminByRole) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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
    let query = supabaseClient
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
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = authHeader?.replace('Bearer ', '') || 
      (cookieHeader?.includes('sb-access-token=') ? 
        cookieHeader.split('sb-access-token=')[1]?.split(';')[0] : null);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token and get user
    const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser(token);
    
    if (userAuthError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is admin by email
    const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || user.email === 'admin@stefa-books.com.ua';
    
    if (!isAdminByEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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
    const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password || 'TempPass123!', // In a real implementation, you would generate a secure password
      email_confirm: true,
      user_metadata: {
        name: body.name,
        phone: body.phone || null
      }
    });
    
    if (createAuthError) {
      logger.error('Admin users API: Failed to create auth user', { error: createAuthError });
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    if (!authData?.user) {
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
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = authHeader?.replace('Bearer ', '') || 
      (cookieHeader?.includes('sb-access-token=') ? 
        cookieHeader.split('sb-access-token=')[1]?.split(';')[0] : null);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token and get user
    const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser(token);
    
    if (userAuthError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is admin by email
    const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || user.email === 'admin@stefa-books.com.ua';
    
    if (!isAdminByEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = authHeader?.replace('Bearer ', '') || 
      (cookieHeader?.includes('sb-access-token=') ? 
        cookieHeader.split('sb-access-token=')[1]?.split(';')[0] : null);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token and get user
    const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser(token);
    
    if (userAuthError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is admin by email
    const isAdminByEmail = user.email === 'admin@stefabooks.com.ua' || user.email === 'admin@stefa-books.com.ua';
    
    if (!isAdminByEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      logger.error('Admin users API: Failed to delete auth user', { error: deleteAuthError, userId });
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