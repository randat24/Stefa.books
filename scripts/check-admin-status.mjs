#!/usr/bin/env node

/**
 * Скрипт для проверки статуса администраторов
 * Использование: node scripts/check-admin-status.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminStatus() {
  try {
    console.log('🔍 Проверка статуса администраторов...\n')
    
    // Проверяем пользователей в auth
    console.log('👤 Пользователи в auth.users:')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Ошибка получения пользователей auth:', authError.message)
    } else {
      authUsers.users.forEach(user => {
        const isAdmin = user.email === 'admin@stefabooks.com.ua' || 
                       user.email === 'admin@stefa-books.com.ua' ||
                       user.email === 'newadmin@stefabooks.com.ua'
        
        console.log(`  ${isAdmin ? '👑' : '👤'} ${user.email} (${user.id})`)
        console.log(`     Created: ${user.created_at}`)
        console.log(`     Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`)
        console.log(`     Last Sign In: ${user.last_sign_in_at || 'Never'}`)
        console.log('')
      })
    }
    
    // Проверяем профили в таблице users
    console.log('👥 Профили в таблице users:')
    const { data: userProfiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profileError) {
      console.error('❌ Ошибка получения профилей:', profileError.message)
    } else {
      userProfiles.forEach(profile => {
        const isAdmin = profile.role === 'admin' || 
                       profile.email === 'admin@stefabooks.com.ua' ||
                       profile.email === 'admin@stefa-books.com.ua' ||
                       profile.email === 'newadmin@stefabooks.com.ua'
        
        console.log(`  ${isAdmin ? '👑' : '👤'} ${profile.email || 'No email'} (${profile.id})`)
        console.log(`     Name: ${profile.name || 'No name'}`)
        console.log(`     Role: ${profile.role || 'No role'}`)
        console.log(`     Status: ${profile.status || 'No status'}`)
        console.log(`     Created: ${profile.created_at}`)
        console.log('')
      })
    }
    
    // Проверяем переменные окружения
    console.log('🔧 Переменные окружения:')
    console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
    console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`)
    console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}`)
    
    console.log('\n✅ Проверка завершена!')
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
  }
}

// Запускаем скрипт
checkAdminStatus()
