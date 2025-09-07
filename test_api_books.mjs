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

async function testBooksAPI() {
    console.log('🔍 Тестирование API книг...\n');

    try {
        // Тест 1: Простой запрос книг
        console.log('1️⃣ Простой запрос книг...');
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id, title, author, available')
            .limit(5);

        if (booksError) {
            console.log('❌ Ошибка при получении книг:', booksError.message);
            console.log('   Детали ошибки:', booksError);
        } else {
            console.log('✅ Книги получены:', books?.length || 0, 'книг');
            if (books && books.length > 0) {
                books.forEach(book => {
                    console.log(`   - ${book.title} by ${book.author} (${book.available ? 'доступна' : 'недоступна'})`);
                });
            }
        }

        // Тест 2: Запрос с фильтрами
        console.log('\n2️⃣ Запрос с фильтрами...');
        const { data: filteredBooks, error: filteredError } = await supabase
            .from('books')
            .select('id, title, author, available')
            .eq('available', true)
            .limit(3);

        if (filteredError) {
            console.log('❌ Ошибка при фильтрации книг:', filteredError.message);
        } else {
            console.log('✅ Отфильтрованные книги:', filteredBooks?.length || 0, 'книг');
        }

        // Тест 3: Подсчет общего количества
        console.log('\n3️⃣ Подсчет общего количества книг...');
        const { count, error: countError } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.log('❌ Ошибка при подсчете книг:', countError.message);
        } else {
            console.log('✅ Общее количество книг:', count || 0);
        }

        // Тест 4: Проверка структуры таблицы
        console.log('\n4️⃣ Проверка структуры таблицы books...');
        const { data: sampleBook, error: sampleError } = await supabase
            .from('books')
            .select('*')
            .limit(1)
            .single();

        if (sampleError) {
            console.log('❌ Ошибка при получении образца книги:', sampleError.message);
        } else {
            console.log('✅ Структура таблицы books:');
            if (sampleBook) {
                Object.keys(sampleBook).forEach(key => {
                    console.log(`   - ${key}: ${typeof sampleBook[key]}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Неожиданная ошибка:', error.message);
        console.error('   Stack trace:', error.stack);
    }

    console.log('\n🎯 Диагностика:');
    console.log('1. Если книги загружаются - проблема в API коде');
    console.log('2. Если ошибка RLS - нужно исправить политики');
    console.log('3. Если ошибка подключения - проблема с переменными окружения');
}

// Запускаем тест
testBooksAPI().catch(console.error);
