#!/usr/bin/env node

/**
 * Frontend Test Script
 * Проверяет отображение данных на фронтенде
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const BASE_URL = 'http://localhost:3000';

async function testPage(page, name) {
    try {
        console.log(`🔍 Тестирование страницы: ${name}`);
        console.log(`   ${BASE_URL}${page}`);
        
        const response = await fetch(`${BASE_URL}${page}`);
        
        if (!response.ok) {
            console.log(`   ❌ Ошибка загрузки: ${response.status}`);
            return { success: false, status: response.status };
        }
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Проверяем основные элементы
        const checks = {
            title: document.querySelector('title')?.textContent || 'N/A',
            hasBooks: document.querySelectorAll('[data-testid="book-card"], .book-card, [class*="book"]').length,
            hasCategories: document.querySelectorAll('[data-testid="category"], .category, [class*="category"]').length,
            hasSearch: !!document.querySelector('input[type="search"], input[placeholder*="поиск"], input[placeholder*="search"]'),
            hasNavigation: !!document.querySelector('nav, header, [role="navigation"]'),
            hasFooter: !!document.querySelector('footer, [role="contentinfo"]')
        };
        
        console.log(`   ✅ Страница загружена`);
        console.log(`   📄 Заголовок: ${checks.title}`);
        console.log(`   📚 Книги найдены: ${checks.hasBooks}`);
        console.log(`   📂 Категории найдены: ${checks.hasCategories}`);
        console.log(`   🔍 Поиск: ${checks.hasSearch ? '✅' : '❌'}`);
        console.log(`   🧭 Навигация: ${checks.hasNavigation ? '✅' : '❌'}`);
        console.log(`   🦶 Футер: ${checks.hasFooter ? '✅' : '❌'}`);
        
        return { success: true, checks };
        
    } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testAllPages() {
    console.log('🌐 Тестирование страниц фронтенда...\n');

    const pages = [
        { path: '/', name: 'Главная страница' },
        { path: '/catalog', name: 'Каталог книг' },
        { path: '/categories', name: 'Категории' },
        { path: '/about', name: 'О нас' },
        { path: '/contact', name: 'Контакты' },
        { path: '/admin', name: 'Админ панель' }
    ];

    const results = [];

    for (const page of pages) {
        const result = await testPage(page.path, page.name);
        results.push({ ...page, ...result });
        console.log('');
    }

    // Итоговая статистика
    console.log('📊 ИТОГОВАЯ СТАТИСТИКА ФРОНТЕНДА:');
    console.log('=====================================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Успешных страниц: ${successful}`);
    console.log(`❌ Неудачных страниц: ${failed}`);
    console.log(`📈 Успешность: ${Math.round((successful / results.length) * 100)}%`);
    
    if (failed > 0) {
        console.log('\n❌ Проблемные страницы:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name}: ${r.error || 'Ошибка загрузки'}`);
        });
    }

    // Анализ функциональности
    const workingPages = results.filter(r => r.success);
    const totalBooks = workingPages.reduce((sum, page) => sum + (page.checks?.hasBooks || 0), 0);
    const pagesWithSearch = workingPages.filter(page => page.checks?.hasSearch).length;
    const pagesWithNavigation = workingPages.filter(page => page.checks?.hasNavigation).length;
    
    console.log('\n🔧 АНАЛИЗ ФУНКЦИОНАЛЬНОСТИ:');
    console.log('=====================================');
    console.log(`📚 Всего книг отображено: ${totalBooks}`);
    console.log(`🔍 Страниц с поиском: ${pagesWithSearch}/${workingPages.length}`);
    console.log(`🧭 Страниц с навигацией: ${pagesWithNavigation}/${workingPages.length}`);

    return results;
}

async function main() {
    console.log('🎨 Проверка фронтенда Stefa.Books\n');
    
    try {
        await testAllPages();
    } catch (error) {
        console.error('❌ Ошибка при тестировании фронтенда:', error);
    }
}

main().catch(console.error);
