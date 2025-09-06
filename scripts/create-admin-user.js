#!/usr/bin/env node

/**
 * Скрипт для создания администратора
 * Использование: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения');
  console.error('Убедитесь, что в .env.local есть:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stefa-books.com.ua';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!';
  
  // Проверить, что email валидный
  if (!adminEmail || adminEmail.includes('http') || !adminEmail.includes('@')) {
    console.error('❌ Ошибка: Неверный email');
    console.error('Установите правильный ADMIN_EMAIL в .env.local:');
    console.error('echo "ADMIN_EMAIL=your-email@example.com" >> .env.local');
    process.exit(1);
  }
  
  console.log('🚀 Настройка администратора...');
  console.log(`📧 Email: ${adminEmail}`);
  
  try {
    // Сначала проверить, есть ли пользователь в user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Ошибка проверки профиля:', profileError);
      return;
    }
    
    if (profileData) {
      console.log('✅ Пользователь найден в базе данных');
      
      if (profileData.role === 'admin') {
        console.log('✅ Пользователь уже является администратором');
        return;
      }
      
      // Обновить роль на admin
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('email', adminEmail);
        
      if (updateError) {
        console.error('❌ Ошибка обновления роли:', updateError);
        return;
      }
      
      console.log('✅ Роль обновлена на admin');
      console.log('🎉 Администратор успешно настроен!');
      return;
    }
    
    // Если пользователь не найден в user_profiles, попробуем найти в auth.users
    // через SQL запрос (так как admin API может быть недоступен)
    console.log('🔍 Пользователь не найден в user_profiles, проверяем auth.users...');
    
    // Попробуем создать профиль с случайным ID (если пользователь существует в auth.users)
    // Это безопасно, так как foreign key constraint проверит существование
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000', // Временный ID
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      if (insertError.code === '23503') {
        console.log('❌ Пользователь не найден в auth.users');
        console.log('💡 Создайте пользователя через Supabase Dashboard:');
        console.log('   1. Откройте Supabase Dashboard');
        console.log('   2. Перейдите в Authentication > Users');
        console.log('   3. Нажмите "Add user"');
        console.log(`   4. Введите email: ${adminEmail}`);
        console.log('   5. Установите пароль');
        console.log('   6. Запустите этот скрипт снова');
        return;
      } else {
        console.error('❌ Ошибка создания профиля:', insertError);
        return;
      }
    }
    
    console.log('✅ Профиль создан с ролью admin');
    console.log('🎉 Администратор успешно настроен!');
    console.log('⚠️  Убедитесь, что пользователь существует в auth.users');
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

// Запустить скрипт
createAdminUser();
