import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking subscription_requests table structure...');
  
  try {
    // Try to get table structure
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'subscription_requests')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Error querying table structure:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Table subscription_requests does not exist');
      return false;
    }
    
    console.log('📋 Current table structure:');
    data.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check what columns are missing
    const requiredColumns = ['id', 'name', 'email', 'phone', 'social', 'plan', 'payment_method', 'message', 'screenshot', 'privacy_consent', 'status', 'created_at', 'updated_at'];
    const existingColumns = data.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
    } else {
      console.log('✅ All required columns exist');
    }
    
    return true;
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

checkTableStructure().then(success => {
  process.exit(success ? 0 : 1);
});
