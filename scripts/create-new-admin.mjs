#!/usr/bin/env node

/**
 * Скрипт для создания нового администратора
 * Использование: node scripts/create-new-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения')
  console.error('Убедитесь, что файл .env.local содержит:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createNewAdmin() {
  try {
    console.log('🚀 Создание нового администратора...')
    
    // Данные нового админа
    const adminEmail = 'newadmin@stefabooks.com.ua'
    const adminPassword = 'newadmin123456'
    const adminName = 'New Admin'
    
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    
    // Создаем пользователя в auth
    console.log('👤 Создание пользователя в auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName
      }
    })
    
    if (authError) {
      console.error('❌ Ошибка создания пользователя:', authError.message)
      return
    }
    
    console.log('✅ Пользователь создан в auth:', authData.user.id)
    
    // Создаем профиль в таблице users
    console.log('👤 Создание профиля в таблице users...')
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        name: adminName,
        role: 'admin',
        subscription_type: 'premium',
        status: 'active',
        created_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error('❌ Ошибка создания профиля:', profileError.message)
      
      // Пытаемся удалить созданного пользователя
      console.log('🧹 Удаление созданного пользователя...')
      await supabase.auth.admin.deleteUser(authData.user.id)
      return
    }
    
    console.log('✅ Профиль создан в таблице users')
    
    console.log('\n🎉 Новый администратор успешно создан!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 User ID:', authData.user.id)
    
    console.log('\n📝 Не забудьте обновить код, если нужно:')
    console.log('- src/lib/auth/roles.ts - добавить новый email')
    console.log('- src/app/api/auth/login/route.ts - добавить новый email')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
createNewAdmin()
