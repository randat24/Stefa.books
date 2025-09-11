#!/usr/bin/env node

/**
 * API Endpoints Test Script
 * Проверяет работу API endpoints сайта
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: data,
            error: response.ok ? null : data
        };
    } catch (error) {
        return {
            success: false,
            status: 0,
            data: null,
            error: error.message
        };
    }
}

async function testAllEndpoints() {
    console.log('🚀 Тестирование API endpoints...\n');

    const endpoints = [
        { path: '/api/books', method: 'GET', name: 'Получение списка книг' },
        { path: '/api/categories', method: 'GET', name: 'Получение категорий' },
        { path: '/api/authors', method: 'GET', name: 'Получение авторов' },
        { path: '/api/subscribe', method: 'POST', name: 'Заявка на подписку', body: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+380123456789',
            plan: 'basic'
        }},
        { path: '/api/admin/books', method: 'GET', name: 'Админ: получение книг' },
        { path: '/api/admin/categories', method: 'GET', name: 'Админ: получение категорий' },
        { path: '/api/admin/users', method: 'GET', name: 'Админ: получение пользователей' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
        console.log(`🔍 Тестирование: ${endpoint.name}`);
        console.log(`   ${endpoint.method} ${endpoint.path}`);
        
        const result = await testAPIEndpoint(endpoint.path, endpoint.method, endpoint.body);
        
        if (result.success) {
            console.log(`   ✅ Успешно (${result.status})`);
            if (result.data && Array.isArray(result.data)) {
                console.log(`   📊 Записей: ${result.data.length}`);
            } else if (result.data && typeof result.data === 'object') {
                console.log(`   📊 Данные получены`);
            }
        } else {
            console.log(`   ❌ Ошибка (${result.status}): ${result.error}`);
        }
        
        results.push({
            ...endpoint,
            ...result
        });
        
        console.log('');
    }

    // Итоговая статистика
    console.log('📊 ИТОГОВАЯ СТАТИСТИКА API:');
    console.log('=====================================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Успешных: ${successful}`);
    console.log(`❌ Неудачных: ${failed}`);
    console.log(`📈 Успешность: ${Math.round((successful / results.length) * 100)}%`);
    
    if (failed > 0) {
        console.log('\n❌ Проблемные endpoints:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name}: ${r.error}`);
        });
    }

    return results;
}

// Проверка доступности сервера
async function checkServerAvailability() {
    console.log('🌐 Проверка доступности сервера...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/books`);
        if (response.ok) {
            console.log('✅ Сервер доступен');
            return true;
        } else {
            console.log(`⚠️ Сервер отвечает, но с ошибкой: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Сервер недоступен. Убедитесь, что приложение запущено:');
        console.log('   npm run dev');
        console.log('   или');
        console.log('   pnpm dev');
        return false;
    }
}

async function main() {
    console.log('🔧 Проверка API endpoints Stefa.Books\n');
    
    const serverAvailable = await checkServerAvailability();
    
    if (!serverAvailable) {
        console.log('\n💡 Для запуска сервера выполните:');
        console.log('   cd /Users/fantomas/Documents/GitHub/Stefa.books.com.ua');
        console.log('   pnpm dev');
        process.exit(1);
    }
    
    console.log('');
    await testAllEndpoints();
}

main().catch(console.error);
