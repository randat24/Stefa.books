#!/usr/bin/env node

/**
 * Скрипт для обновления структуры таблицы books
 * Использование: node scripts/update-books-table.mjs
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

async function updateBooksTable() {
  try {
    console.log('🔧 Обновление структуры таблицы books...')
    
    // SQL для добавления новых полей
    const sql = `
      -- Добавляем поля для админ панели
      ALTER TABLE public.books 
      ADD COLUMN IF NOT EXISTS publisher TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
      ADD COLUMN IF NOT EXISTS full_price_uah DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS notes TEXT;
      
      -- Обновляем существующие записи
      UPDATE public.books 
      SET 
        status = CASE 
          WHEN available = true THEN 'active'
          ELSE 'inactive'
        END,
        full_price_uah = price_uah
      WHERE status IS NULL;
    `
    
    // Выполняем SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Ошибка выполнения SQL:', error.message)
      return false
    }
    
    console.log('✅ Структура таблицы обновлена')
    return true
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message)
    return false
  }
}

// Запускаем скрипт
updateBooksTable()
