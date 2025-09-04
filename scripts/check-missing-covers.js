#!/usr/bin/env node

/**
 * ПРОВЕРКА КНИГ БЕЗ ОБЛОЖЕК
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findBooksWithoutCovers() {
  console.log('🔍 Поиск книг без Cloudinary обложек...\n');
  
  const { data: allBooks } = await supabase
    .from('books')
    .select('code, title, cover_url')
    .order('code');
  
  const { data: booksWithCovers } = await supabase
    .from('books')
    .select('code')
    .like('cover_url', '%cloudinary%');
  
  const booksWithCoversCodes = new Set(booksWithCovers.map(b => b.code));
  
  const booksWithoutCovers = allBooks.filter(book => !booksWithCoversCodes.has(book.code));
  
  console.log(`📊 Статистика:`);
  console.log(`📚 Всего книг в БД: ${allBooks.length}`);
  console.log(`✅ Книг с Cloudinary обложками: ${booksWithCovers.length}`);
  console.log(`❌ Книг без Cloudinary обложек: ${booksWithoutCovers.length}`);
  console.log(`📈 Процент покрытия: ${Math.round((booksWithCovers.length / allBooks.length) * 100)}%\n`);
  
  if (booksWithoutCovers.length > 0) {
    console.log('📚 Книги без Cloudinary обложек:');
    booksWithoutCovers.forEach(book => {
      console.log(`❌ ${book.code}: ${book.title}`);
      if (book.cover_url) {
        if (book.cover_url.includes('drive.google.com')) {
          console.log(`   📁 Google Drive ссылка: ${book.cover_url}`);
        } else {
          console.log(`   🔗 Другая ссылка: ${book.cover_url}`);
        }
      } else {
        console.log(`   ❌ Нет обложки`);
      }
    });
  }
}

findBooksWithoutCovers();
