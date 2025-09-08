import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Отсутствуют переменные окружения');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminSimple() {
    console.log('🔐 Создание пользователя admin@stefa-books.com.ua...\n');

    try {
        // Сначала проверим, существует ли пользователь
        console.log('1️⃣ Проверяем существующих пользователей...');
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.log('❌ Ошибка при получении списка пользователей:', listError.message);
            return;
        }

        const existingUser = existingUsers.users.find(u => u.email === 'admin@stefa-books.com.ua');
        
        if (existingUser) {
            console.log('✅ Пользователь admin@stefa-books.com.ua уже существует!');
            console.log('   ID:', existingUser.id);
            console.log('   Подтвержден:', !!existingUser.email_confirmed_at);
            
            // Попробуем сбросить пароль
            console.log('\n2️⃣ Сбрасываем пароль...');
            const { error: resetError } = await supabase.auth.admin.updateUserById(existingUser.id, {
                password: 'admin123456'
            });
            
            if (resetError) {
                console.log('❌ Ошибка при сбросе пароля:', resetError.message);
            } else {
                console.log('✅ Пароль сброшен на: admin123456');
            }
        } else {
            console.log('❌ Пользователь admin@stefa-books.com.ua не найден');
            console.log('📝 Создайте его вручную через Supabase Dashboard');
        }

        // Тестируем вход
        console.log('\n3️⃣ Тестируем вход...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@stefa-books.com.ua',
            password: 'admin123456'
        });

        if (signInError) {
            console.log('❌ Ошибка при входе:', signInError.message);
            console.log('\n💡 Попробуйте:');
            console.log('1. Создать пользователя через Supabase Dashboard');
            console.log('2. Или использовать существующих пользователей:');
            console.log('   - randat24@gmail.com');
            console.log('   - anastasia@stefa-books.com.ua');
            console.log('3. Сбросить им пароль через Dashboard');
        } else {
            console.log('✅ Вход успешен!');
            console.log('   Пользователь:', signInData.user.email);
            console.log('   ID:', signInData.user.id);
            
            console.log('\n🎯 Теперь вы можете войти в админ панель:');
            console.log('1. Перейдите на: https://stefa-books.com.ua/admin/login');
            console.log('2. Email: admin@stefa-books.com.ua');
            console.log('3. Пароль: admin123456');
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем создание
createAdminSimple().catch(console.error);
