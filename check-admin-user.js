const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Проверяем админ пользователя...');
    
    // Проверяем существование админа
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@stefa-books.com.ua')
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Админ пользователь не найден, создаем...');
      
      // Создаем админ пользователя
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'admin@stefa-books.com.ua',
          name: 'Администратор',
          role: 'admin',
          status: 'active',
          password_hash: '$2a$10$8K1p/a0dL3L4.5D.6E.7F.8G.9H.0I.1J.2K.3L.4M.5N.6O.7P.8Q.9R.0S.1T.2U.3V.4W.5X.6Y.7Z', // Временный хеш
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Ошибка создания админа:', createError.message);
        return false;
      }
      
      console.log('✅ Админ пользователь создан:', newAdmin);
      return true;
      
    } else if (checkError) {
      console.log('❌ Ошибка проверки:', checkError.message);
      return false;
    } else {
      console.log('✅ Админ пользователь уже существует:', existingAdmin);
      
      // Обновляем пароль если нужно
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: '$2a$10$8K1p/a0dL3L4.5D.6E.7F.8G.9H.0I.1J.2K.3L.4M.5N.6O.7P.8Q.9R.0S.1T.2U.3V.4W.5X.6Y.7Z',
          role: 'admin',
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@stefa-books.com.ua');
      
      if (updateError) {
        console.log('❌ Ошибка обновления админа:', updateError.message);
        return false;
      }
      
      console.log('✅ Админ пользователь обновлен');
      return true;
    }
    
  } catch (err) {
    console.log('❌ Ошибка:', err.message);
    return false;
  }
}

checkAndCreateAdmin();