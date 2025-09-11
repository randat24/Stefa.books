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

async function updateAdminRole() {
  try {
    console.log('🔍 Ищем пользователя admin@stefabooks.com.ua...');
    
    // Получаем пользователя
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
    
    // Обновляем роль пользователя
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        user_metadata: {
          ...adminUser.user_metadata,
          role: 'admin'
        }
      }
    );
    
    if (updateError) {
      console.error('❌ Ошибка обновления роли:', updateError.message);
      return;
    }
    
    console.log('✅ Роль обновлена на admin');
    
    // Проверяем результат
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@stefabooks.com.ua',
      password: 'oqP_Ia5VMO2wy46p'
    });
    
    if (loginError) {
      console.error('❌ Ошибка входа:', loginError.message);
    } else {
      console.log('✅ Успешный вход!');
      console.log('👤 User ID:', user.id);
      console.log('📧 Email:', user.email);
      console.log('🔑 Role:', user.user_metadata?.role);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

updateAdminRole();
