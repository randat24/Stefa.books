const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseFix() {
  console.log('🔍 Verifying database fix...\n');

  try {
    // Check if status column exists in books table
    console.log('📚 Checking books table structure:');
    const { data: sampleBook, error: bookError } = await supabase
      .from('books')
      .select('id, title, author, status, is_active, category')
      .limit(1);

    if (bookError) {
      console.error('❌ Error checking books table:', bookError.message);
    } else if (sampleBook && sampleBook.length > 0) {
      const book = sampleBook[0];
      if ('status' in book) {
        console.log('✅ Status column exists in books table');
        console.log(`   Sample: "${book.title}" - Status: ${book.status}, Active: ${book.is_active}`);
      } else {
        console.log('❌ Status column still missing in books table');
      }
    }

    // Check categories table
    console.log('\n📂 Checking categories table:');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error checking categories table:', categoriesError.message);
    } else {
      console.log(`✅ Categories table exists with ${categories?.length || 0} sample records`);
      categories?.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    }

    // Check books_with_authors view
    console.log('\n📖 Checking books_with_authors view:');
    const { data: booksWithAuthors, error: viewError } = await supabase
      .from('books_with_authors')
      .select('id, title, author, status, author_name, category_name')
      .limit(3);

    if (viewError) {
      console.error('❌ Error checking books_with_authors view:', viewError.message);
    } else {
      console.log(`✅ Books_with_authors view works with ${booksWithAuthors?.length || 0} sample records`);
      booksWithAuthors?.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author_name || book.author} (Status: ${book.status})`);
      });
    }

    // Count records
    console.log('\n📊 Record counts:');
    
    const { count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .neq('category', 'subscription-request');

    const { count: booksWithAuthorsCount } = await supabase
      .from('books_with_authors')
      .select('*', { count: 'exact', head: true });

    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    console.log(`📚 Books table: ${booksCount} records`);
    console.log(`📖 Books_with_authors view: ${booksWithAuthorsCount} records`);
    console.log(`📂 Categories table: ${categoriesCount} records`);

    // Check if counts match
    if (booksCount === booksWithAuthorsCount) {
      console.log('✅ Books and books_with_authors counts match!');
    } else {
      console.log('⚠️  Books and books_with_authors counts do not match!');
    }

    if (booksCount === 105) {
      console.log('✅ Perfect! We have exactly 105 books as expected.');
    } else {
      console.log(`⚠️  Expected 105 books, but found ${booksCount}`);
    }

    console.log('\n🎉 Database verification completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyDatabaseFix();
