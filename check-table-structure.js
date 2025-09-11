#!/usr/bin/env node

/**
 * Table Structure Check Script
 * Проверяет реальную структуру таблицы books
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
    console.log('🔍 Проверка структуры таблицы books...\n');

    try {
        // Получаем одну запись, чтобы увидеть все доступные поля
        const { data: sampleBook, error } = await supabase
            .from('books')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('❌ Ошибка при получении записи:', error);
            return;
        }

        console.log('✅ Структура таблицы books:');
        console.log('=====================================');
        
        const fields = Object.keys(sampleBook);
        fields.forEach(field => {
            const value = sampleBook[field];
            const type = typeof value;
            const hasValue = value !== null && value !== undefined;
            console.log(`📋 ${field}: ${type} ${hasValue ? `(${value})` : '(null/undefined)'}`);
        });

        console.log('\n📊 Всего полей:', fields.length);

        // Проверяем, какие поля есть в database.types.ts
        console.log('\n🔍 Сравнение с database.types.ts:');
        console.log('=====================================');
        
        const expectedFields = [
            'id', 'title', 'author', 'category', 'subcategory', 'description', 
            'short_description', 'code', 'isbn', 'pages', 'age_range', 'language', 
            'publisher', 'publication_year', 'cover_url', 'status', 'available', 
            'rating', 'rating_count', 'price_daily', 'price_weekly', 'price_monthly', 
            'badges', 'tags', 'search_vector', 'search_text', 'created_at', 'updated_at'
        ];

        expectedFields.forEach(field => {
            const exists = fields.includes(field);
            const status = exists ? '✅' : '❌';
            console.log(`${status} ${field}`);
        });

        const missingFields = expectedFields.filter(field => !fields.includes(field));
        const extraFields = fields.filter(field => !expectedFields.includes(field));

        if (missingFields.length > 0) {
            console.log('\n❌ Отсутствующие поля:', missingFields.join(', '));
        }

        if (extraFields.length > 0) {
            console.log('\n➕ Дополнительные поля:', extraFields.join(', '));
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error);
    }
}

// Run the check
checkTableStructure();
