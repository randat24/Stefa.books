#!/usr/bin/env node

/**
 * Скрипт для добавления колонки role в таблицу profiles
 * Использование: node scripts/add-role-column.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения')
  console.error('Убедитесь, что в .env.local есть:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addRoleColumn() {
  console.log('🚀 Добавление колонки role в таблицу profiles...')
  
  try {
    // Выполняем SQL запрос напрямую
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';` 
    })
    
    if (error) {
      console.error('❌ Ошибка выполнения SQL запроса:', error)
      
      // Попробуем другой подход
      console.log('🔄 Пробуем другой подход...')
      
      // Создаем функцию для выполнения SQL
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE OR REPLACE FUNCTION add_role_column()
          RETURNS void AS $$
          BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
          END;
          $$ LANGUAGE plpgsql;
          
          SELECT add_role_column();
        ` 
      })
      
      if (createFunctionError) {
        console.error('❌ Ошибка создания функции:', createFunctionError)
        return
      }
      
      console.log('✅ Функция создана и выполнена')
    } else {
      console.log('✅ Колонка role добавлена в таблицу profiles')
    }
    
    // Обновляем роль пользователя
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@stefa-books.com.ua'
    console.log(`🔄 Обновляем роль пользователя ${adminEmail} на admin...`)
    
    const { error: updateError } = await supabase.rpc('exec_sql', { 
      sql: `UPDATE profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = '${adminEmail}');` 
    })
    
    if (updateError) {
      console.error('❌ Ошибка обновления роли:', updateError)
      return
    }
    
    console.log('✅ Роль пользователя обновлена на admin')
    console.log('🎉 Операция завершена!')
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

// Запустить скрипт
addRoleColumn()
