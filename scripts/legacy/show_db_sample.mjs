import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function showSample() {
  const { data: books } = await supabase
    .from('books')
    .select('id, code, title, author, cover_url')
    .limit(15);
  
  console.log('📚 Sample books from database:');
  books.forEach((book, i) => {
    console.log(`${i+1}. [${book.code || 'NO_CODE'}] "${book.title}" by ${book.author}`);
    console.log(`   Cover: ${book.cover_url || 'No cover'}`);
    console.log('');
  });
}

showSample().catch(console.error);