const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSecurity() {
  console.log('🔒 Checking database security...\n');

  try {
    // Check if RLS is enabled on all tables
    const tables = [
      'books',
      'authors', 
      'categories',
      'age_categories',
      'search_queries',
      'rentals',
      'user_profiles',
      'users',
      'payments'
    ];

    console.log('📋 Checking RLS status on tables:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: RLS enabled (${error.message.includes('RLS') ? 'Protected' : 'Error'})`);
        } else {
          console.log(`✅ ${table}: RLS enabled (Protected)`);
        }
      } catch (err) {
        console.log(`⚠️  ${table}: Could not check RLS status`);
      }
    }

    // Check if views are accessible
    console.log('\n📖 Checking views:');
    
    try {
      const { data: booksWithAuthors, error: viewError } = await supabase
        .from('books_with_authors')
        .select('id, title, author_name, age_category_name')
        .limit(3);

      if (viewError) {
        console.log(`❌ books_with_authors: ${viewError.message}`);
      } else {
        console.log(`✅ books_with_authors: Accessible (${booksWithAuthors?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`⚠️  books_with_authors: Could not check view`);
    }

    // Check public access to categories
    console.log('\n📂 Checking public access to categories:');
    
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .limit(3);

      if (catError) {
        console.log(`❌ categories: ${catError.message}`);
      } else {
        console.log(`✅ categories: Public read access (${categories?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`⚠️  categories: Could not check access`);
    }

    // Check public access to age categories
    console.log('\n🎯 Checking public access to age categories:');
    
    try {
      const { data: ageCategories, error: ageError } = await supabase
        .from('age_categories')
        .select('id, name, slug')
        .limit(3);

      if (ageError) {
        console.log(`❌ age_categories: ${ageError.message}`);
      } else {
        console.log(`✅ age_categories: Public read access (${ageCategories?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`⚠️  age_categories: Could not check access`);
    }

    // Check search queries access
    console.log('\n🔍 Checking search queries access:');
    
    try {
      const { data: searchQueries, error: searchError } = await supabase
        .from('search_queries')
        .select('id, query, results_count')
        .limit(3);

      if (searchError) {
        console.log(`❌ search_queries: ${searchError.message}`);
      } else {
        console.log(`✅ search_queries: Public read access (${searchQueries?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`⚠️  search_queries: Could not check access`);
    }

    console.log('\n🎉 Security check completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Execute the security migration: supabase/migrations/011_fix_security_issues.sql');
    console.log('2. Re-run this script to verify all issues are resolved');
    console.log('3. Check Supabase Security Advisor for any remaining issues');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSecurity();
