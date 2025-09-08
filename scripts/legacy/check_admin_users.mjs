import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmymryhkfnexjurstkdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW1yeWhrZm5leGp1cnN0a2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTI1MzQsImV4cCI6MjA3MjgyODUzNH0.GnsYIrkwhXIR7GJz0o1ezqzQ28D44uzWIsjyKWUsGqc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUsers() {
  try {
    console.log('🔍 Проверяем админ пользователей...');
    
    // Проверяем таблицу users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');
    
    if (usersError) {
      console.error('❌ Ошибка при получении пользователей:', usersError);
      return;
    }
    
    console.log('👥 Админ пользователи в базе данных:');
    if (users.length === 0) {
      console.log('❌ Админ пользователи не найдены');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.name} (ID: ${user.id})`);
      });
    }
    
    // Проверяем всех пользователей
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('email, name, role')
      .limit(5);
    
    if (!allUsersError) {
      console.log('\n👤 Все пользователи (первые 5):');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.name} (роль: ${user.role || 'не указана'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

checkAdminUsers();
