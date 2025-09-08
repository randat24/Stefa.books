import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSubscriptionRequestsTable() {
  console.log('🔧 Creating subscription_requests table...');
  
  try {
    // Read SQL file
    const sqlContent = fs.readFileSync('create_subscription_requests_table.sql', 'utf8');
    
    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error creating table:', error.message);
      return false;
    }
    
    console.log('✅ Table created successfully!');
    return true;
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

// Alternative approach - try to create table directly
async function createTableDirectly() {
  console.log('🔧 Creating subscription_requests table directly...');
  
  try {
    // Check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'subscription_requests');
    
    if (tablesError) {
      console.log('⚠️ Could not check existing tables, trying to create...');
    } else if (tables && tables.length > 0) {
      console.log('✅ Table subscription_requests already exists');
      return true;
    }
    
    // Try to insert a test record to see if table exists
    const { error: insertError } = await supabase
      .from('subscription_requests')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        payment_method: 'monobank',
        privacy_consent: true
      });
    
    if (insertError) {
      console.log('❌ Table does not exist, need to create it manually');
      console.log('Please run the SQL script in Supabase dashboard:');
      console.log('1. Go to Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the content of create_subscription_requests_table.sql');
      return false;
    } else {
      console.log('✅ Table exists and is working!');
      // Clean up test record
      await supabase
        .from('subscription_requests')
        .delete()
        .eq('email', 'test@example.com');
      return true;
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

createTableDirectly().then(success => {
  if (success) {
    console.log('🎉 Subscription requests table is ready!');
  } else {
    console.log('⚠️ Please create the table manually in Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
});
