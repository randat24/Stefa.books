const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingTables() {
  console.log('🔍 Checking existing tables in database...\n');

  try {
    // Try to get table names using a direct query
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Could not query information_schema:', tablesError.message);
      
      // Try alternative approach - test each table individually
      console.log('\n🔍 Testing individual tables...');
      
      const tablesToTest = [
        'books',
        'authors', 
        'categories',
        'users',
        'rentals',
        'book_authors',
        'search_queries',
        'subscription_requests'
      ];

      for (const tableName of tablesToTest) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`❌ Table '${tableName}': ${error.message}`);
          } else {
            console.log(`✅ Table '${tableName}': exists`);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}': ${err.message}`);
        }
      }
    } else {
      console.log('📋 Available tables:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // Check what's in the books table structure
    console.log('\n📚 Checking books table structure...');
    const { data: sampleBook, error: bookError } = await supabase
      .from('books')
      .select('*')
      .limit(1);

    if (bookError) {
      console.error('❌ Error getting sample book:', bookError.message);
    } else if (sampleBook && sampleBook.length > 0) {
      console.log('📖 Books table columns:');
      Object.keys(sampleBook[0]).forEach(column => {
        console.log(`  - ${column}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkExistingTables();
