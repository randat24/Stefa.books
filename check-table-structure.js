const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');

  try {
    // Get sample data from books table to see actual structure
    console.log('📚 Books table structure (sample data):');
    const { data: sampleBooks, error: sampleError } = await supabase
      .from('books')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('❌ Error getting sample books:', sampleError.message);
    } else {
      console.log('📖 Sample books structure:');
      if (sampleBooks && sampleBooks.length > 0) {
        const firstBook = sampleBooks[0];
        console.log('Columns in books table:');
        Object.keys(firstBook).forEach(key => {
          console.log(`  - ${key}: ${typeof firstBook[key]} (${firstBook[key]})`);
        });
      }
    }

    // Check books_with_authors structure
    console.log('\n📖 Books_with_authors table structure (sample data):');
    const { data: sampleBooksWithAuthors, error: sampleBooksWithAuthorsError } = await supabase
      .from('books_with_authors')
      .select('*')
      .limit(3);

    if (sampleBooksWithAuthorsError) {
      console.error('❌ Error getting sample books_with_authors:', sampleBooksWithAuthorsError.message);
    } else {
      console.log('📚 Sample books_with_authors structure:');
      if (sampleBooksWithAuthors && sampleBooksWithAuthors.length > 0) {
        const firstBook = sampleBooksWithAuthors[0];
        console.log('Columns in books_with_authors table:');
        Object.keys(firstBook).forEach(key => {
          console.log(`  - ${key}: ${typeof firstBook[key]} (${firstBook[key]})`);
        });
      }
    }

    // Compare counts
    console.log('\n📊 Record counts:');
    const { count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    const { count: booksWithAuthorsCount } = await supabase
      .from('books_with_authors')
      .select('*', { count: 'exact', head: true });

    console.log(`Books table: ${booksCount} records`);
    console.log(`Books_with_authors table: ${booksWithAuthorsCount} records`);

    if (booksCount !== booksWithAuthorsCount) {
      console.log('⚠️  WARNING: Different record counts!');
    } else {
      console.log('✅ Record counts match');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableStructure();