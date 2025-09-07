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

async function createAdminAuthUser() {
    console.log('🔐 Создание пользователя admin@stefa-books.com.ua в Supabase Auth...\n');

    try {
        // Создаем пользователя в Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: 'admin@stefa-books.com.ua',
            password: 'admin123456', // Временный пароль
            email_confirm: true, // Подтверждаем email сразу
            user_metadata: {
                name: 'Головний Адміністратор',
                role: 'admin'
            }
        });

        if (authError) {
            console.log('❌ Ошибка при создании пользователя в auth.users:', authError.message);
            
            // Проверяем, может пользователь уже существует
            if (authError.message.includes('already registered')) {
                console.log('ℹ️ Пользователь уже существует в auth.users');
                
                // Получаем существующего пользователя
                const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail('admin@stefa-books.com.ua');
                
                if (getUserError) {
                    console.log('❌ Ошибка при получении существующего пользователя:', getUserError.message);
                } else {
                    console.log('✅ Пользователь найден в auth.users:', existingUser.user.email);
                    console.log('   ID:', existingUser.user.id);
                    console.log('   Подтвержден:', !!existingUser.user.email_confirmed_at);
                }
            }
        } else {
            console.log('✅ Пользователь создан в auth.users:', authUser.user.email);
            console.log('   ID:', authUser.user.id);
            console.log('   Подтвержден:', !!authUser.user.email_confirmed_at);
        }

        // Проверяем, что пользователь может войти
        console.log('\n🔍 Тестирование входа...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@stefa-books.com.ua',
            password: 'admin123456'
        });

        if (signInError) {
            console.log('❌ Ошибка при входе:', signInError.message);
        } else {
            console.log('✅ Вход успешен!');
            console.log('   Пользователь:', signInData.user.email);
            console.log('   ID:', signInData.user.id);
        }

        console.log('\n🎯 Инструкции для входа:');
        console.log('1. Перейдите на: https://stefa-books.com.ua/admin/login');
        console.log('2. Email: admin@stefa-books.com.ua');
        console.log('3. Пароль: admin123456');
        console.log('4. После входа смените пароль на более безопасный');

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем создание пользователя
createAdminAuthUser().catch(console.error);
