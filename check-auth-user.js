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

async function checkAuthUser() {
  try {
    console.log('🔍 Проверяем пользователя в auth.users...');
    
    // Получаем всех пользователей
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Ошибка получения пользователей:', usersError.message);
      return;
    }
    
    console.log(`📊 Всего пользователей: ${users.length}`);
    
    // Ищем админ-пользователя
    const adminUser = users.find(user => user.email === 'admin@stefa-books.com.ua');
    
    if (adminUser) {
      console.log('✅ Админ-пользователь найден!');
      console.log('👤 ID:', adminUser.id);
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Role:', adminUser.user_metadata?.role);
      console.log('📅 Created:', adminUser.created_at);
      console.log('✅ Email confirmed:', adminUser.email_confirmed_at ? 'Да' : 'Нет');
      console.log('🔐 Password hash exists:', adminUser.encrypted_password ? 'Да' : 'Нет');
    } else {
      console.log('❌ Админ-пользователь не найден');
    }
    
    // Показываем всех пользователей
    console.log('\n📋 Все пользователи:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.user_metadata?.role || 'user'})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkAuthUser();
