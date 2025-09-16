const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStructure() {
  try {
    console.log('🔍 Проверяем структуру базы данных...\n');

    // Проверяем типы данных в таблице books
    const { data: bookSample, error: bookError } = await supabase
      .from('books')
      .select('id, title, category_id')
      .limit(3);

    if (bookError) {
      console.error('❌ Ошибка получения книг:', bookError);
    } else {
      console.log('📚 Примеры книг:');
      bookSample.forEach(book => {
        console.log(`   ID: ${book.id} (type: ${typeof book.id})`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Category ID: ${book.category_id} (type: ${typeof book.category_id})`);
        console.log('   ---');
      });
    }

    // Проверяем категории
    const { data: categorySample, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (categoryError) {
      console.error('❌ Ошибка получения категорий:', categoryError);
    } else {
      console.log('\n📂 Примеры категорий:');
      categorySample.forEach(cat => {
        console.log(`   ID: ${cat.id} (type: ${typeof cat.id})`);
        console.log(`   Name: ${cat.name}`);
        console.log('   ---');
      });
    }

    // Попробуем обновить одну книгу для проверки
    console.log('\n🧪 Тестируем назначение категории...');

    if (bookSample?.[0] && categorySample?.[0]) {
      const testBookId = bookSample[0].id;
      const testCategoryId = categorySample[0].id;

      console.log(`Пытаемся назначить книге ${testBookId} категорию ${testCategoryId}`);

      // Попробуем только category_id
      const { data: updateResult, error: updateError } = await supabase
        .from('books')
        .update({ category_id: testCategoryId })
        .eq('id', testBookId)
        .select();

      if (updateError) {
        console.error('❌ Ошибка обновления:', updateError);
      } else {
        console.log('✅ Успешно обновлено:', updateResult);

        // Откатываем изменение
        await supabase
          .from('books')
          .update({ category_id: null })
          .eq('id', testBookId);
        console.log('🔄 Изменение откачено');
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkStructure();