#!/usr/bin/env node

/**
 * Скрипт для сброса пароля администратора
 * Использование: node scripts/reset-admin-password.mjs
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

async function resetAdminPassword() {
  try {
    console.log('🔐 Сброс пароля администратора...')
    
    // ID текущего админа (можно изменить)
    const adminId = 'aa8dc94e-999f-4e57-9ce4-2b019e0ddd45'
    const newPassword = 'admin123456' // Новый пароль
    
    console.log(`🆔 Admin ID: ${adminId}`)
    console.log(`🔑 New Password: ${newPassword}`)
    
    // Обновляем пароль
    console.log('🔄 Обновление пароля...')
    const { data, error } = await supabase.auth.admin.updateUserById(adminId, {
      password: newPassword
    })
    
    if (error) {
      console.error('❌ Ошибка обновления пароля:', error.message)
      return
    }
    
    console.log('✅ Пароль успешно обновлен!')
    console.log('📧 Email:', data.user.email)
    console.log('🔑 New Password:', newPassword)
    
    console.log('\n📝 Не забудьте обновить пароль в коде, если нужно:')
    console.log('- src/app/admin/login/page.tsx - обновить подсказку')
    console.log('- Документацию')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
resetAdminPassword()
