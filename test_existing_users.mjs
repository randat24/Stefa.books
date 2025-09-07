import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Отсутствуют переменные окружения');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExistingUsers() {
    console.log('🔐 Тестирование входа с существующими пользователями...\n');

    const testUsers = [
        { email: 'randat24@gmail.com', password: 'password123' },
        { email: 'anastasia@stefa-books.com.ua', password: 'password123' },
        { email: 'randat24@gmail.com', password: 'admin123456' },
        { email: 'anastasia@stefa-books.com.ua', password: 'admin123456' },
        { email: 'randat24@gmail.com', password: '123456' },
        { email: 'anastasia@stefa-books.com.ua', password: '123456' }
    ];

    for (const user of testUsers) {
        try {
            console.log(`🔍 Тестируем: ${user.email} с паролем: ${user.password}`);
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: user.password
            });

            if (signInError) {
                console.log(`❌ Ошибка: ${signInError.message}`);
            } else {
                console.log(`✅ УСПЕХ! Вход выполнен для ${user.email}`);
                console.log(`   ID: ${signInData.user.id}`);
                console.log(`   Email подтвержден: ${!!signInData.user.email_confirmed_at}`);
                
                // Выходим из системы
                await supabase.auth.signOut();
                console.log('   Выход выполнен\n');
                
                console.log('🎯 ИНСТРУКЦИИ ДЛЯ ВХОДА:');
                console.log(`1. Перейдите на: https://stefa-books.com.ua/admin/login`);
                console.log(`2. Email: ${user.email}`);
                console.log(`3. Пароль: ${user.password}`);
                console.log('4. После входа вы сможете управлять админ панелью');
                
                return; // Прерываем тестирование после первого успешного входа
            }
        } catch (error) {
            console.log(`❌ Исключение: ${error.message}`);
        }
        
        console.log(''); // Пустая строка между тестами
    }

    console.log('❌ Ни один из тестовых паролей не подошел');
    console.log('\n💡 Рекомендации:');
    console.log('1. Создайте пользователя admin@stefa-books.com.ua в Supabase Dashboard');
    console.log('2. Или сбросьте пароль для существующих пользователей');
    console.log('3. Или используйте Supabase Dashboard для входа');
}

// Запускаем тестирование
testExistingUsers().catch(console.error);
