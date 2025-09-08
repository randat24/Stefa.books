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

async function checkAuthUsers() {
    console.log('🔍 Проверка пользователей в auth.users...\n');

    try {
        // Проверяем пользователей в auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Ошибка при получении пользователей auth.users:', authError.message);
        } else {
            console.log('✅ Пользователи в auth.users:', authUsers?.users?.length || 0);
            if (authUsers?.users && authUsers.users.length > 0) {
                authUsers.users.forEach(user => {
                    console.log(`   - ${user.email} (${user.id}) - ${user.email_confirmed_at ? 'подтвержден' : 'не подтвержден'}`);
                });
            }
        }

        // Проверяем пользователей в public.users
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('id, email, name, role');

        if (publicError) {
            console.log('❌ Ошибка при получении пользователей public.users:', publicError.message);
        } else {
            console.log('\n✅ Пользователи в public.users:', publicUsers?.length || 0);
            if (publicUsers && publicUsers.length > 0) {
                publicUsers.forEach(user => {
                    console.log(`   - ${user.email} (${user.id}) - ${user.role}`);
                });
            }
        }

        console.log('\n🎯 Проблема:');
        console.log('1. Пользователи созданы в public.users');
        console.log('2. Но система аутентификации ищет их в auth.users');
        console.log('3. Нужно создать пользователей в Supabase Auth');

        console.log('\n💡 Решение:');
        console.log('1. Создать пользователей в Supabase Auth через Dashboard');
        console.log('2. Или использовать API для создания пользователей');
        console.log('3. Или изменить систему аутентификации для работы с public.users');

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
    }
}

// Запускаем проверку
checkAuthUsers().catch(console.error);
