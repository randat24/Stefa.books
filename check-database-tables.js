const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Check if books table exists and count records
    console.log('📚 Checking books table:');
    const { data: books, error: booksError, count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (booksError) {
      console.error('❌ Error checking books table:', booksError.message);
    } else {
      console.log(`✅ Books table exists with ${booksCount} records`);
    }

    // Check if books_with_authors table/view exists
    console.log('\n📖 Checking books_with_authors table/view:');
    const { data: booksWithAuthors, error: booksWithAuthorsError, count: booksWithAuthorsCount } = await supabase
      .from('books_with_authors')
      .select('*', { count: 'exact', head: true });

    if (booksWithAuthorsError) {
      console.log(`❌ books_with_authors table/view does not exist: ${booksWithAuthorsError.message}`);
    } else {
      console.log(`✅ books_with_authors table/view exists with ${booksWithAuthorsCount} records`);
    }

    // Check all tables in the database
    console.log('\n🗂️ All tables in database:');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_all_tables');

    if (tablesError) {
      // Alternative method to get table names
      console.log('Using alternative method to list tables...');
      
      // Try to query information_schema
      const { data: schemaTables, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (schemaError) {
        console.log('❌ Could not list tables:', schemaError.message);
      } else {
        console.log('📋 Available tables:');
        schemaTables?.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      }
    } else {
      console.log('📋 Available tables:');
      tables?.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // Check if there are any views
    console.log('\n👁️ Checking for views:');
    const { data: views, error: viewsError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public');

    if (viewsError) {
      console.log('❌ Could not list views:', viewsError.message);
    } else {
      if (views && views.length > 0) {
        console.log('📋 Available views:');
        views.forEach(view => {
          console.log(`  - ${view.table_name}`);
        });
      } else {
        console.log('ℹ️ No views found');
      }
    }

    // Get sample data from books table
    console.log('\n📖 Sample books data:');
    const { data: sampleBooks, error: sampleError } = await supabase
      .from('books')
      .select('id, title, author, status, is_active')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error getting sample books:', sampleError.message);
    } else {
      console.log('📚 Sample books:');
      sampleBooks?.forEach(book => {
        console.log(`  - ${book.title} by ${book.author} (Status: ${book.status}, Active: ${book.is_active})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Create a function to get all tables (if the RPC doesn't exist)
async function createGetAllTablesFunction() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION get_all_tables()
      RETURNS TABLE(table_name text) AS $$
      BEGIN
        RETURN QUERY
        SELECT t.table_name::text
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name;
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (error) {
    console.log('ℹ️ Could not create get_all_tables function:', error.message);
  }
}

checkDatabaseTables();
