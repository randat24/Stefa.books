import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logger.info('Creating admin user', {}, 'Admin');
    
    // Создаем админа в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@stefa-books.com.ua',
      password: 'Admin123!@#',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Stefa Books',
        role: 'admin'
      },
      app_metadata: {
        role: 'admin'
      }
    });

    if (authError) {
      logger.error('Failed to create admin user in auth', { error: authError }, 'Admin');
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create admin user in auth',
        details: authError.message
      }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ 
        success: false,
        error: 'No user data returned from auth creation'
      }, { status: 500 });
    }

    // Создаем профиль админа в таблице users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@stefa-books.com.ua',
        name: 'Admin Stefa Books',
        phone: null,
        role: 'admin',
        status: 'active',
        subscription_type: 'maxi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      logger.error('Failed to create admin profile', { error: profileError }, 'Admin');
      // Не возвращаем ошибку, так как пользователь уже создан в auth
    }

    logger.info('Admin user created successfully', { 
      userId: authData.user.id,
      email: authData.user.email 
    }, 'Admin');

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        userId: authData.user.id,
        email: authData.user.email,
        credentials: {
          email: 'admin@stefa-books.com.ua',
          password: 'Admin123!@#'
        }
      }
    });
    
  } catch (error) {
    logger.error('Admin user creation failed', error, 'Admin');
    return NextResponse.json({ 
      success: false, 
      error: 'Admin user creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
