#!/usr/bin/env node

/**
 * Full System Check Script
 * Полная проверка системы Stefa.Books
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runScript(scriptPath, name) {
    try {
        console.log(`\n🚀 Запуск: ${name}`);
        console.log('='.repeat(50));
        
        const { stdout, stderr } = await execAsync(`node ${scriptPath}`);
        
        if (stdout) {
            console.log(stdout);
        }
        
        if (stderr) {
            console.error('⚠️ Предупреждения:', stderr);
        }
        
        return { success: true, output: stdout, warnings: stderr };
    } catch (error) {
        console.error(`❌ Ошибка в ${name}:`, error.message);
        return { success: false, error: error.message };
    }
}

async function checkSystemRequirements() {
    console.log('🔧 Проверка системных требований...\n');
    
    try {
        // Проверка Node.js
        const { stdout: nodeVersion } = await execAsync('node --version');
        console.log(`✅ Node.js: ${nodeVersion.trim()}`);
        
        // Проверка pnpm
        try {
            const { stdout: pnpmVersion } = await execAsync('pnpm --version');
            console.log(`✅ pnpm: ${pnpmVersion.trim()}`);
        } catch {
            console.log('⚠️ pnpm не найден, используется npm');
        }
        
        // Проверка файлов
        const requiredFiles = [
            'package.json',
            '.env.local',
            'src/lib/supabase.ts',
            'src/app/api/books/route.ts'
        ];
        
        console.log('\n📁 Проверка файлов:');
        for (const file of requiredFiles) {
            try {
                await execAsync(`test -f ${file}`);
                console.log(`✅ ${file}`);
            } catch {
                console.log(`❌ ${file} - не найден`);
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка проверки системы:', error.message);
    }
}

async function main() {
    console.log('🎯 ПОЛНАЯ ПРОВЕРКА СИСТЕМЫ STEFA.BOOKS');
    console.log('='.repeat(60));
    console.log('Дата:', new Date().toLocaleString('uk-UA'));
    console.log('='.repeat(60));
    
    // 1. Проверка системных требований
    await checkSystemRequirements();
    
    // 2. Проверка структуры базы данных
    const dbResult = await runScript('check-database-structure.js', 'Проверка базы данных');
    
    // 3. Проверка API endpoints
    const apiResult = await runScript('test-api-endpoints.js', 'Проверка API');
    
    // 4. Проверка фронтенда
    const frontendResult = await runScript('test-frontend.js', 'Проверка фронтенда');
    
    // Итоговый отчет
    console.log('\n🎉 ИТОГОВЫЙ ОТЧЕТ');
    console.log('='.repeat(60));
    
    const results = [
        { name: 'База данных', result: dbResult },
        { name: 'API', result: apiResult },
        { name: 'Фронтенд', result: frontendResult }
    ];
    
    results.forEach(({ name, result }) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${name}: ${result.success ? 'Работает' : 'Проблемы'}`);
    });
    
    const allWorking = results.every(r => r.success);
    
    if (allWorking) {
        console.log('\n🎊 ВСЕ СИСТЕМЫ РАБОТАЮТ КОРРЕКТНО!');
        console.log('Сайт готов к использованию.');
    } else {
        console.log('\n⚠️ ОБНАРУЖЕНЫ ПРОБЛЕМЫ');
        console.log('Проверьте ошибки выше и исправьте их.');
    }
    
    console.log('\n💡 Для запуска сайта выполните:');
    console.log('   pnpm dev');
    console.log('   Затем откройте http://localhost:3000');
}

main().catch(console.error);
