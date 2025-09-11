#!/usr/bin/env node

/**
 * Simple Catalog Test
 * Простой тест каталога
 */

import fetch from 'node-fetch';

async function testCatalogSimple() {
    console.log('🔍 Простой тест каталога...\n');

    try {
        // Test 1: Check if the page loads
        console.log('1️⃣ Проверка загрузки страницы...');
        const pageResponse = await fetch('http://localhost:3000/books');
        
        if (pageResponse.ok) {
            console.log('✅ Страница загружается:', pageResponse.status);
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

        // Test 2: Check API
        console.log('\n2️⃣ Проверка API...');
        const apiResponse = await fetch('http://localhost:3000/api/books?limit=1');
        
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            console.log('✅ API работает:', data.success);
            console.log('📖 Количество книг:', data.data?.length || 0);
        } else {
            console.error('❌ API не работает:', apiResponse.status);
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Run the test
testCatalogSimple();