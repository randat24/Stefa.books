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

async function fixSubscriptionTable() {
  console.log('🔧 Fixing subscription_requests table...');
  
  try {
    // First, let's try to add the missing column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE subscription_requests ADD COLUMN IF NOT EXISTS social VARCHAR(255);'
    });
    
    if (alterError) {
      console.log('⚠️ Could not add column via RPC, trying direct approach...');
      
      // Try to test if table exists by querying it
      const { error: queryError } = await supabase
        .from('subscription_requests')
        .select('id')
        .limit(1);
      
      if (queryError) {
        console.log('❌ Table does not exist or has issues:', queryError.message);
        console.log('Please create the table manually in Supabase dashboard using the SQL script');
        return false;
      }
      
      console.log('✅ Table exists, but column might be missing');
    } else {
      console.log('✅ Column added successfully!');
    }
    
    // Test the table by trying to insert a test record
    const { data, error: insertError } = await supabase
      .from('subscription_requests')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        social: '@testuser',
        plan: 'mini',
        payment_method: 'monobank',
        privacy_consent: true
      })
      .select();
    
    if (insertError) {
      console.log('❌ Error inserting test record:', insertError.message);
      return false;
    }
    
    console.log('✅ Table is working correctly!');
    
    // Clean up test record
    if (data && data[0]) {
      await supabase
        .from('subscription_requests')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Test record cleaned up');
    }
    
    return true;
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

fixSubscriptionTable().then(success => {
  if (success) {
    console.log('🎉 Subscription requests table is ready!');
  } else {
    console.log('⚠️ Please fix the table manually in Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
});
