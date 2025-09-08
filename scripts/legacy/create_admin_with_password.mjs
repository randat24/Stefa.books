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

async function createAdminWithPassword() {
    console.log('🔐 Создание пользователя admin@stefa-books.com.ua с правильным паролем...\n');

    try {
        // Создаем пользователя в Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: 'admin@stefa-books.com.ua',
            password: 'xqcBT*A*N!.88p.',
            email_confirm: true, // Подтверждаем email сразу
            user_metadata: {
                name: 'Головний Адміністратор',
                role: 'admin'
            }
        });

        if (authError) {
            console.log('❌ Ошибка при создании пользователя:', authError.message);
            
            // Проверяем, может пользователь уже существует
            if (authError.message.includes('already registered')) {
                console.log('ℹ️ Пользователь уже существует, пытаемся обновить пароль...');
                
                // Получаем существующего пользователя
                const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail('admin@stefa-books.com.ua');
                
                if (getUserError) {
                    console.log('❌ Ошибка при получении пользователя:', getUserError.message);
                } else {
                    console.log('✅ Пользователь найден, обновляем пароль...');
                    
                    // Обновляем пароль
                    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.user.id, {
                        password: 'xqcBT*A*N!.88p.'
                    });
                    
                    if (updateError) {
                        console.log('❌ Ошибка при обновлении пароля:', updateError.message);
                    } else {
                        console.log('✅ Пароль обновлен успешно!');
                    }
                }
            }
        } else {
            console.log('✅ Пользователь создан успешно!');
            console.log('   ID:', authUser.user.id);
            console.log('   Email:', authUser.user.email);
            console.log('   Подтвержден:', !!authUser.user.email_confirmed_at);
        }

        // Тестируем вход
        console.log('\n🔍 Тестируем вход...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@stefa-books.com.ua',
            password: 'xqcBT*A*N!.88p.'
        });

        if (signInError) {
            console.log('❌ Ошибка при входе:', signInError.message);
        } else {
            console.log('✅ Вход успешен!');
            console.log('   Пользователь:', signInData.user.email);
            console.log('   ID:', signInData.user.id);
            
            console.log('\n🎯 ТЕПЕРЬ ВЫ МОЖЕТЕ ВОЙТИ В АДМИН ПАНЕЛЬ:');
            console.log('1. Перейдите на: https://stefa-books.com.ua/admin/login');
            console.log('2. Email: admin@stefa-books.com.ua');
            console.log('3. Пароль: xqcBT*A*N!.88p.');
            console.log('4. Нажмите "Войти"');
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем создание
createAdminWithPassword().catch(console.error);
