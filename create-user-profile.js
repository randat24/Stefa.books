const { createClient } = require('@supabase/supabase-js');

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Переменные окружения не найдены!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserProfile() {
  try {
    console.log('🔍 Ищем пользователя admin@stefabooks.com.ua...');
    
    // Получаем пользователя из auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Ошибка получения пользователей:', usersError.message);
      return;
    }
    
    const adminUser = users.find(user => user.email === 'admin@stefabooks.com.ua');
    
    if (!adminUser) {
      console.error('❌ Пользователь не найден');
      return;
    }
    
    console.log('✅ Пользователь найден:', adminUser.id);
    
    // Проверяем, есть ли уже профиль
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminUser.email);
    
    if (profileError) {
      console.error('❌ Ошибка проверки профиля:', profileError.message);
      return;
    }
    
    if (existingProfile && existingProfile.length > 0) {
      console.log('✅ Профиль уже существует:', existingProfile[0]);
      return;
    }
    
    // Создаем профиль
    console.log('🔨 Создаем профиль пользователя...');
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.user_metadata?.full_name || adminUser.email,
        role: 'admin',
        subscription_type: 'premium',
        status: 'active'
      })
      .select('*')
      .single();
    
    if (createError) {
      console.error('❌ Ошибка создания профиля:', createError.message);
      return;
    }
    
    console.log('✅ Профиль создан:', newProfile);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createUserProfile();
