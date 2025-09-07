import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Отсутствуют необходимые переменные окружения');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

// Создаем клиент Supabase с service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Данные пользователей для создания
const usersToCreate = [
    {
        email: 'admin@stefa-books.com.ua',
        name: 'Головний Адміністратор',
        role: 'admin',
        phone: '+38 (063) 856-54-14',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Головний адміністратор системи Stefa.Books'
    },
    {
        email: 'anastasia@stefa-books.com.ua',
        name: 'Анастасія',
        role: 'admin',
        phone: '+38 (050) 123-45-67',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Адміністратор системи Stefa.Books'
    },
    {
        email: 'randat24@gmail.com',
        name: 'Розробник',
        role: 'admin',
        phone: '+38 (067) 987-65-43',
        subscription_type: 'premium',
        status: 'active',
        notes: 'Розробник та адміністратор проекту Stefa.Books'
    }
];

async function createUsers() {
    console.log('🚀 Создание пользователей в системе Stefa.Books...\n');

    // Сначала проверим существующих пользователей
    console.log('🔍 Проверяем существующих пользователей...');
    const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('email, name, role, status')
        .in('email', usersToCreate.map(u => u.email));

    if (fetchError) {
        console.error('❌ Ошибка при получении пользователей:', fetchError.message);
        return;
    }

    console.log('📊 Найдено существующих пользователей:', existingUsers?.length || 0);
    if (existingUsers && existingUsers.length > 0) {
        existingUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.role}, ${user.status})`);
        });
    }

    console.log('\n👥 Создаем/обновляем пользователей...\n');

    for (const userData of usersToCreate) {
        try {
            console.log(`📝 Обрабатываем: ${userData.email}`);

            // Проверяем, существует ли пользователь
            const existingUser = existingUsers?.find(u => u.email === userData.email);

            if (existingUser) {
                // Обновляем существующего пользователя
                console.log(`  🔄 Обновляем существующего пользователя...`);
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({
                        name: userData.name,
                        role: userData.role,
                        phone: userData.phone,
                        subscription_type: userData.subscription_type,
                        status: userData.status,
                        notes: userData.notes,
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', userData.email)
                    .select();

                if (updateError) {
                    console.error(`  ❌ Ошибка обновления: ${updateError.message}`);
                } else {
                    console.log(`  ✅ Пользователь обновлен: ${updatedUser[0]?.name}`);
                }
            } else {
                // Создаем нового пользователя
                console.log(`  ➕ Создаем нового пользователя...`);
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        id: crypto.randomUUID(),
                        ...userData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select();

                if (createError) {
                    console.error(`  ❌ Ошибка создания: ${createError.message}`);
                } else {
                    console.log(`  ✅ Пользователь создан: ${newUser[0]?.name}`);
                }
            }

        } catch (error) {
            console.error(`  ❌ Неожиданная ошибка для ${userData.email}:`, error.message);
        }

        console.log(''); // Пустая строка для разделения
    }

    // Проверяем финальный результат
    console.log('🔍 Проверяем финальный результат...');
    const { data: finalUsers, error: finalError } = await supabase
        .from('users')
        .select('email, name, role, phone, subscription_type, status, created_at, updated_at')
        .in('email', usersToCreate.map(u => u.email))
        .order('created_at', { ascending: true });

    if (finalError) {
        console.error('❌ Ошибка при получении финального результата:', finalError.message);
        return;
    }

    console.log('\n📊 Финальный результат:');
    console.log('=' .repeat(80));
    
    if (finalUsers && finalUsers.length > 0) {
        finalUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Роль: ${user.role}`);
            console.log(`   Телефон: ${user.phone || 'Не указан'}`);
            console.log(`   Подписка: ${user.subscription_type}`);
            console.log(`   Статус: ${user.status}`);
            console.log(`   Создан: ${new Date(user.created_at).toLocaleString('uk-UA')}`);
            console.log(`   Обновлен: ${new Date(user.updated_at).toLocaleString('uk-UA')}`);
            console.log('');
        });
    } else {
        console.log('❌ Пользователи не найдены');
    }

    // Общая статистика
    const { data: allUsers, error: statsError } = await supabase
        .from('users')
        .select('role, status');

    if (!statsError && allUsers) {
        const totalUsers = allUsers.length;
        const adminUsers = allUsers.filter(u => u.role === 'admin').length;
        const activeUsers = allUsers.filter(u => u.status === 'active').length;

        console.log('📈 Общая статистика пользователей:');
        console.log(`   Всего пользователей: ${totalUsers}`);
        console.log(`   Администраторов: ${adminUsers}`);
        console.log(`   Активных пользователей: ${activeUsers}`);
    }

    console.log('\n🎉 Создание пользователей завершено!');
}

// Запускаем создание пользователей
createUsers().catch(console.error);
