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

async function resetExistingUserPassword() {
    console.log('🔐 Сброс пароля для существующего пользователя...\n');

    // Используем anastasia@stefa-books.com.ua (он есть в auth.users)
    const userEmail = 'anastasia@stefa-books.com.ua';
    const newPassword = 'xqcBT*A*N!.88p.';

    try {
        // Получаем пользователя
        console.log(`1️⃣ Получаем пользователя ${userEmail}...`);
        const { data: userData, error: getUserError } = await supabase.auth.admin.getUserByEmail(userEmail);
        
        if (getUserError) {
            console.log('❌ Ошибка при получении пользователя:', getUserError.message);
            return;
        }

        console.log('✅ Пользователь найден:');
        console.log('   ID:', userData.user.id);
        console.log('   Email:', userData.user.email);
        console.log('   Подтвержден:', !!userData.user.email_confirmed_at);

        // Обновляем пароль
        console.log(`\n2️⃣ Обновляем пароль на: ${newPassword}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(userData.user.id, {
            password: newPassword
        });

        if (updateError) {
            console.log('❌ Ошибка при обновлении пароля:', updateError.message);
        } else {
            console.log('✅ Пароль обновлен успешно!');
        }

        // Тестируем вход
        console.log('\n3️⃣ Тестируем вход...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
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
            console.log(`2. Email: ${userEmail}`);
            console.log(`3. Пароль: ${newPassword}`);
            console.log('4. Нажмите "Войти"');
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем сброс пароля
resetExistingUserPassword().catch(console.error);
