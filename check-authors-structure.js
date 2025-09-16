const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthorsStructure() {
  console.log('🔍 Checking authors table structure...\n');

  try {
    // Get sample data from authors table
    const { data: sampleAuthors, error: authorsError } = await supabase
      .from('authors')
      .select('*')
      .limit(3);

    if (authorsError) {
      console.error('❌ Error getting sample authors:', authorsError.message);
    } else {
      console.log('📖 Authors table structure:');
      if (sampleAuthors && sampleAuthors.length > 0) {
        const firstAuthor = sampleAuthors[0];
        console.log('Columns in authors table:');
        Object.keys(firstAuthor).forEach(key => {
          console.log(`  - ${key}: ${typeof firstAuthor[key]} (${firstAuthor[key]})`);
        });
      } else {
        console.log('ℹ️ No authors found in table');
      }
    }

    // Check if we have any authors at all
    const { count: authorsCount, error: countError } = await supabase
      .from('authors')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting authors:', countError.message);
    } else {
      console.log(`\n📊 Total authors in database: ${authorsCount}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAuthorsStructure();
