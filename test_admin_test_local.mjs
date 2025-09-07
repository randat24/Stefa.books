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

async function testAdminTestLocal() {
    console.log('🔐 Тестирование входа с admin@test.local...\n');

    const adminCredentials = {
        email: 'admin@test.local',
        password: 'SimplePass123'
    };

    try {
        console.log(`🔍 Тестируем: ${adminCredentials.email}`);
        console.log(`🔑 Пароль: ${adminCredentials.password}`);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminCredentials.email,
            password: adminCredentials.password
        });

        if (signInError) {
            console.log(`❌ Ошибка входа: ${signInError.message}`);
            
            if (signInError.message.includes('Invalid login credentials')) {
                console.log('\n💡 Возможные причины:');
                console.log('1. Пользователь admin@test.local не существует в auth.users');
                console.log('2. Пароль неверный');
                console.log('3. Email не подтвержден');
            }
        } else {
            console.log(`✅ УСПЕХ! Вход выполнен для ${adminCredentials.email}`);
            console.log(`   ID: ${signInData.user.id}`);
            console.log(`   Email подтвержден: ${!!signInData.user.email_confirmed_at}`);
            console.log(`   Создан: ${signInData.user.created_at}`);
            
            // Выходим из системы
            await supabase.auth.signOut();
            console.log('   Выход выполнен\n');
            
            console.log('🎯 ТЕПЕРЬ ВЫ МОЖЕТЕ ВОЙТИ В АДМИН ПАНЕЛЬ:');
            console.log('1. Перейдите на: https://stefa-books.com.ua/admin/login');
            console.log(`2. Email: ${adminCredentials.email}`);
            console.log(`3. Пароль: ${adminCredentials.password}`);
            console.log('4. Нажмите "Войти"');
            
            console.log('\n✅ Настройка завершена!');
            console.log('   - Пользователь: admin@test.local');
            console.log('   - Пароль: SimplePass123');
            console.log('   - Статус: готов к использованию');
        }
    } catch (error) {
        console.log(`❌ Исключение: ${error.message}`);
    }
}

// Запускаем тестирование
testAdminTestLocal().catch(console.error);
