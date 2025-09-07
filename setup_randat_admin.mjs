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

async function setupRandatAdmin() {
    console.log('🔐 Настройка администратора randat24@gmail.com...\n');

    try {
        // Получаем пользователя
        console.log('1️⃣ Получаем пользователя randat24@gmail.com...');
        const { data: userData, error: getUserError } = await supabase.auth.admin.getUserByEmail('randat24@gmail.com');
        
        if (getUserError) {
            console.log('❌ Ошибка при получении пользователя:', getUserError.message);
            return;
        }

        console.log('✅ Пользователь найден:');
        console.log('   ID:', userData.user.id);
        console.log('   Email:', userData.user.email);
        console.log('   Подтвержден:', !!userData.user.email_confirmed_at);

        // Обновляем пароль
        const newPassword = 'xqcBT*A*N!.88p.';
        console.log(`\n2️⃣ Обновляем пароль на: ${newPassword}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(userData.user.id, {
            password: newPassword
        });

        if (updateError) {
            console.log('❌ Ошибка при обновлении пароля:', updateError.message);
        } else {
            console.log('✅ Пароль обновлен успешно!');
        }

        // Обновляем роль в public.users
        console.log('\n3️⃣ Обновляем роль в public.users...');
        const { error: updateRoleError } = await supabase
            .from('users')
            .update({ 
                role: 'admin',
                name: 'Розробник',
                status: 'active',
                subscription_type: 'premium'
            })
            .eq('email', 'randat24@gmail.com');

        if (updateRoleError) {
            console.log('❌ Ошибка при обновлении роли:', updateRoleError.message);
        } else {
            console.log('✅ Роль обновлена на admin!');
        }

        // Тестируем вход
        console.log('\n4️⃣ Тестируем вход...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'randat24@gmail.com',
            password: newPassword
        });

        if (signInError) {
            console.log('❌ Ошибка при входе:', signInError.message);
        } else {
            console.log('✅ Вход успешен!');
            console.log('   Пользователь:', signInData.user.email);
            console.log('   ID:', signInData.user.id);
            
            // Выходим из системы
            await supabase.auth.signOut();
            console.log('   Выход выполнен\n');
            
            console.log('🎯 ТЕПЕРЬ ВЫ МОЖЕТЕ ВОЙТИ В АДМИН ПАНЕЛЬ:');
            console.log('1. Перейдите на: https://stefa-books.com.ua/admin/login');
            console.log('2. Email: randat24@gmail.com');
            console.log('3. Пароль: xqcBT*A*N!.88p.');
            console.log('4. Нажмите "Войти"');
            
            console.log('\n✅ Настройка завершена!');
            console.log('   - Пользователь: randat24@gmail.com');
            console.log('   - Роль: admin');
            console.log('   - Статус: active');
            console.log('   - Подписка: premium');
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем настройку
setupRandatAdmin().catch(console.error);
