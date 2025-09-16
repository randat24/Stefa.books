const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyBooksFix() {
  console.log('🔧 Applying books table structure fix...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-books-table-structure.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📖 Reading SQL file...');
    console.log(`📄 File size: ${sqlContent.length} characters`);

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`📝 ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            if (data) {
              console.log(`📊 Result:`, data);
            }
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n🎉 Books table structure fix completed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, status, is_active, category')
      .limit(5);

    if (booksError) {
      console.error('❌ Error verifying books:', booksError.message);
    } else {
      console.log('✅ Books table verification:');
      books?.forEach(book => {
        console.log(`  - "${book.title}" by ${book.author} (Status: ${book.status}, Active: ${book.is_active})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyBooksFix();
