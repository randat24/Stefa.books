import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFields() {
  try {
    // Get one record to see actual fields
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (books && books.length > 0) {
      console.log('📚 Actual database fields:');
      console.log(Object.keys(books[0]));
      
      console.log('\n📖 Sample record:');
      console.log(JSON.stringify(books[0], null, 2));
    } else {
      console.log('❌ No books found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFields();