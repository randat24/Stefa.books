import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Отсутствуют необходимые переменные окружения');
    process.exit(1);
}

// Создаем клиенты Supabase
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminAccess() {
    console.log('🔍 Тестирование доступа к админ панели...\n');

    // Тест 1: Проверка подключения через anon key
    console.log('1️⃣ Тест подключения через anon key...');
    try {
        const { data: booksData, error: booksError } = await supabaseAnon
            .from('books')
            .select('id, title, author')
            .limit(5);

        if (booksError) {
            console.log('❌ Ошибка при получении книг через anon key:', booksError.message);
        } else {
            console.log('✅ Книги получены через anon key:', booksData?.length || 0, 'книг');
        }
    } catch (error) {
        console.log('❌ Исключение при получении книг через anon key:', error.message);
    }

    // Тест 2: Проверка подключения через service key
    console.log('\n2️⃣ Тест подключения через service key...');
    try {
        const { data: booksData, error: booksError } = await supabaseService
            .from('books')
            .select('id, title, author')
            .limit(5);

        if (booksError) {
            console.log('❌ Ошибка при получении книг через service key:', booksError.message);
        } else {
            console.log('✅ Книги получены через service key:', booksData?.length || 0, 'книг');
        }
    } catch (error) {
        console.log('❌ Исключение при получении книг через service key:', error.message);
    }

    // Тест 3: Проверка пользователей через anon key
    console.log('\n3️⃣ Тест получения пользователей через anon key...');
    try {
        const { data: usersData, error: usersError } = await supabaseAnon
            .from('users')
            .select('id, name, email, role')
            .limit(5);

        if (usersError) {
            console.log('❌ Ошибка при получении пользователей через anon key:', usersError.message);
        } else {
            console.log('✅ Пользователи получены через anon key:', usersData?.length || 0, 'пользователей');
            if (usersData && usersData.length > 0) {
                usersData.forEach(user => {
                    console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
                });
            }
        }
    } catch (error) {
        console.log('❌ Исключение при получении пользователей через anon key:', error.message);
    }

    // Тест 4: Проверка пользователей через service key
    console.log('\n4️⃣ Тест получения пользователей через service key...');
    try {
        const { data: usersData, error: usersError } = await supabaseService
            .from('users')
            .select('id, name, email, role')
            .limit(5);

        if (usersError) {
            console.log('❌ Ошибка при получении пользователей через service key:', usersError.message);
        } else {
            console.log('✅ Пользователи получены через service key:', usersData?.length || 0, 'пользователей');
            if (usersData && usersData.length > 0) {
                usersData.forEach(user => {
                    console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
                });
            }
        }
    } catch (error) {
        console.log('❌ Исключение при получении пользователей через service key:', error.message);
    }

    // Тест 5: Проверка RLS политик
    console.log('\n5️⃣ Проверка RLS политик...');
    try {
        const { data: policiesData, error: policiesError } = await supabaseService
            .from('pg_policies')
            .select('policyname, cmd, qual')
            .eq('tablename', 'users')
            .eq('schemaname', 'public');

        if (policiesError) {
            console.log('❌ Ошибка при получении RLS политик:', policiesError.message);
        } else {
            console.log('✅ RLS политики для таблицы users:', policiesData?.length || 0, 'политик');
            if (policiesData && policiesData.length > 0) {
                policiesData.forEach(policy => {
                    console.log(`   - ${policy.policyname} (${policy.cmd})`);
                });
            }
        }
    } catch (error) {
        console.log('❌ Исключение при получении RLS политик:', error.message);
    }

    console.log('\n🎯 Рекомендации:');
    console.log('1. Если anon key не работает - нужно исправить RLS политики');
    console.log('2. Если service key работает - база данных в порядке');
    console.log('3. Админ панель использует anon key, поэтому нужны правильные RLS политики');
    console.log('\n📝 Для исправления выполните SQL скрипт: fix_rls_users_policy_simple.sql');
}

// Запускаем тест
testAdminAccess().catch(console.error);
