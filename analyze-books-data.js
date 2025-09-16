const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeBooksData() {
  console.log('🔍 Analyzing books data...\n');

  try {
    // Get all books and analyze their categories
    console.log('📚 Analyzing books by category:');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, category, is_active, created_at');

    if (booksError) {
      console.error('❌ Error getting books:', booksError.message);
      return;
    }

    // Group by category
    const categoryCounts = {};
    const realBooks = [];
    const subscriptionRequests = [];

    books.forEach(book => {
      if (book.category === 'subscription-request') {
        subscriptionRequests.push(book);
      } else {
        realBooks.push(book);
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });

    console.log(`📖 Total records: ${books.length}`);
    console.log(`📚 Real books: ${realBooks.length}`);
    console.log(`📝 Subscription requests: ${subscriptionRequests.length}`);
    console.log('\n📊 Books by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} books`);
    });

    // Show some real books
    console.log('\n📖 Sample real books:');
    realBooks.slice(0, 5).forEach(book => {
      console.log(`  - "${book.title}" by ${book.author} (${book.category})`);
    });

    // Check if we have the expected 105 books
    if (realBooks.length === 105) {
      console.log('\n✅ Perfect! We have exactly 105 real books as expected.');
    } else {
      console.log(`\n⚠️  We have ${realBooks.length} real books, but expected 105.`);
    }

    // Check for missing status column
    console.log('\n🔍 Checking for status column:');
    const { data: sampleBook, error: sampleError } = await supabase
      .from('books')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error getting sample book:', sampleError.message);
    } else if (sampleBook && sampleBook.length > 0) {
      const book = sampleBook[0];
      if ('status' in book) {
        console.log('✅ Status column exists');
      } else {
        console.log('❌ Status column missing - we need to add it');
        console.log('📋 Available columns:', Object.keys(book).join(', '));
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

analyzeBooksData();
