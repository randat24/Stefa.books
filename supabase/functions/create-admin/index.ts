import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export const handler = async (req: Request) => {
  try {
    const { email, password, name } = await req.json();

    // Создаем пользователя в auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'admin'
      }
    });

    if (authError) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authError.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Создаем профиль в таблице users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: 'admin',
        phone: '+38 (063) 856-54-14',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Администратор системы',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Ошибка создания профиля: ${profileError.message}` 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Администратор создан успешно',
        data: {
          id: authData.user.id,
          email: email,
          name: name,
          role: 'admin'
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Внутренняя ошибка сервера' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
