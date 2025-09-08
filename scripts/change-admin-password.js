#!/usr/bin/env node

/**
 * Скрипт для смены пароля администратора
 * Использует Supabase Admin API для обновления пароля
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

// Генерация сложного пароля
function generateSecurePassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Добавляем по одному символу из каждой категории
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Добавляем еще 12 случайных символов
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = 0; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Перемешиваем символы
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function changeAdminPassword() {
  const adminEmail = 'admin@stefabooks.com.ua';
  const newPassword = generateSecurePassword();
  
  console.log('🔐 Смена пароля администратора...');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Новый пароль: ${newPassword}`);
  console.log('');
  
  try {
    // Получаем пользователя по email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Ошибка при получении списка пользователей:', listError.message);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error('❌ Администратор не найден в базе данных');
      console.error('Сначала создайте пользователя через Supabase Dashboard');
      return;
    }
    
    console.log('✅ Администратор найден:', adminUser.id);
    
    // Обновляем пароль
    const { data, error } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: newPassword
    });
    
    if (error) {
      console.error('❌ Ошибка при смене пароля:', error.message);
      return;
    }
    
    console.log('✅ Пароль успешно изменен!');
    console.log('');
    console.log('📋 Новые данные для входа:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');
    console.log('⚠️  Сохраните эти данные в безопасном месте!');
    console.log('');
    console.log('🔗 URL для входа: http://localhost:3000/admin/login');
    
    // Обновляем тестовые данные на странице входа
    updateLoginPagePassword(newPassword);
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message);
  }
}

function updateLoginPagePassword(newPassword) {
  const fs = require('fs');
  const path = require('path');
  
  const loginPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'login', 'page.tsx');
  
  try {
    let content = fs.readFileSync(loginPagePath, 'utf8');
    
    // Обновляем пароль в тестовых данных
    const oldPasswordRegex = /Password: <span className="font-mono">admin123456<\/span>/;
    const newPasswordHtml = `Password: <span className="font-mono">${newPassword}</span>`;
    
    if (oldPasswordRegex.test(content)) {
      content = content.replace(oldPasswordRegex, newPasswordHtml);
      fs.writeFileSync(loginPagePath, content, 'utf8');
      console.log('✅ Тестовые данные на странице входа обновлены');
    } else {
      console.log('⚠️  Не удалось обновить тестовые данные на странице входа');
    }
  } catch (error) {
    console.log('⚠️  Ошибка при обновлении страницы входа:', error.message);
  }
}

// Запуск скрипта
if (require.main === module) {
  changeAdminPassword().then(() => {
    console.log('');
    console.log('🎉 Готово! Теперь вы можете войти с новым паролем.');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { changeAdminPassword, generateSecurePassword };
