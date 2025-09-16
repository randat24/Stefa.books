#!/usr/bin/env node

/**
 * Скрипт для обновления роли пользователя напрямую через SQL запрос
 * Использование: node scripts/update-admin-role.js
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

async function updateAdminRole() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stefa-books.com.ua'
  
  console.log('🚀 Обновление роли пользователя...')
  console.log(`📧 Email: ${adminEmail}`)
  
  try {
    // Выполняем SQL запрос напрямую
    const { data, error } = await supabase.rpc('update_user_to_admin', { 
      admin_email: adminEmail 
    })
    
    if (error) {
      console.error('❌ Ошибка выполнения SQL запроса:', error)
      
      // Попробуем создать функцию, если она не существует
      console.log('🔄 Создаем SQL функцию update_user_to_admin...')
      
      const { error: createFunctionError } = await supabase.rpc('create_admin_function')
      
      if (createFunctionError) {
        console.error('❌ Ошибка создания функции:', createFunctionError)
        
        // Последняя попытка - выполнить SQL запрос напрямую
        console.log('🔄 Пробуем выполнить SQL запрос напрямую...')
        
        const { data: sqlData, error: sqlError } = await supabase.from('profiles')
          .update({ role: 'admin' })
          .eq('id', await getUserIdByEmail(adminEmail))
        
        if (sqlError) {
          console.error('❌ Ошибка выполнения SQL запроса:', sqlError)
          return
        }
        
        console.log('✅ Роль пользователя обновлена напрямую через SQL')
      } else {
        console.log('✅ Функция создана, пробуем снова...')
        
        // Пробуем снова вызвать функцию
        const { data: retryData, error: retryError } = await supabase.rpc('update_user_to_admin', { 
          admin_email: adminEmail 
        })
        
        if (retryError) {
          console.error('❌ Ошибка выполнения SQL запроса после создания функции:', retryError)
          return
        }
        
        console.log('✅ Роль пользователя обновлена через функцию')
      }
    } else {
      console.log('✅ Роль пользователя обновлена через функцию')
    }
    
    console.log('🎉 Операция завершена!')
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

async function getUserIdByEmail(email) {
  try {
    // Получаем ID пользователя по email
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Ошибка получения списка пользователей:', error)
      return null
    }
    
    const user = data.users.find(user => user.email === email)
    
    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`)
      return null
    }
    
    console.log(`✅ Найден пользователь с ID: ${user.id}`)
    return user.id
  } catch (error) {
    console.error('❌ Ошибка получения ID пользователя:', error)
    return null
  }
}

// Запустить скрипт
updateAdminRole()
