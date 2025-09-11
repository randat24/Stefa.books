#!/usr/bin/env node

/**
 * Debug Catalog Component
 * Тестирование компонента каталога
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

async function testCatalogDebug() {
    console.log('🔍 Тестирование каталога...\n');

    try {
        // Test 1: Direct Supabase query
        console.log('1️⃣ Прямой запрос к Supabase...');
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select(`
                id, title, author, category, description, pages, cover_url,
                is_active, subcategory_id, author_text, author_id,
                search_vector, search_text, created_at, updated_at
            `)
            .order('title', { ascending: true })
            .range(0, 4);

        if (booksError) {
            console.error('❌ Ошибка при получении книг:', booksError);
        } else {
            console.log('✅ Книги получены:', books.length);
            console.log('📚 Примеры:', books.slice(0, 2));
        }

        // Test 2: API endpoint
        console.log('\n2️⃣ Тестирование API endpoint...');
        const response = await fetch('http://localhost:3000/api/books?limit=3');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API работает:', data.success);
            console.log('📖 Количество книг:', data.data?.length || 0);
            if (data.data && data.data.length > 0) {
                console.log('📚 Пример книги:', {
                    id: data.data[0].id,
                    title: data.data[0].title,
                    author: data.data[0].author,
                    category: data.data[0].category,
                    is_active: data.data[0].is_active
                });
            }
        } else {
            console.error('❌ API не работает:', response.status, response.statusText);
        }

        // Test 3: Frontend page
        console.log('\n3️⃣ Тестирование фронтенда...');
        const pageResponse = await fetch('http://localhost:3000/books');
        
        if (pageResponse.ok) {
            const html = await pageResponse.text();
            if (html.includes('Завантаження каталогу книг')) {
                console.log('⚠️ Показывается состояние загрузки');
            } else if (html.includes('Каталог книг')) {
                console.log('✅ Заголовок каталога найден');
            } else {
                console.log('❓ Неизвестное состояние');
            }
        } else {
            console.error('❌ Страница не загружается:', pageResponse.status);
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error);
    }
}

// Run the test
testCatalogDebug();