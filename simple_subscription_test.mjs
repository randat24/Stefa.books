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

async function testSubscriptionTable() {
  console.log('🧪 Testing subscription_requests table...');
  
  try {
    // Try to query the table to see what columns exist
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying table:', error.message);
      
      // If table doesn't exist, let's try to create it with minimal structure
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.log('🔧 Table does not exist, trying to create minimal structure...');
        
        // Try to create a simple table structure
        const { error: createError } = await supabase
          .from('subscription_requests')
          .insert({
            name: 'Test',
            email: 'test@test.com',
            phone: '+380123456789',
            plan: 'mini',
            payment_method: 'monobank',
            privacy_consent: true
          });
        
        if (createError) {
          console.log('❌ Cannot create table via insert:', createError.message);
          console.log('Please create the table manually in Supabase dashboard');
          console.log('Use this SQL:');
          console.log(`
CREATE TABLE subscription_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  social VARCHAR(255),
  plan VARCHAR(20) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  message TEXT,
  screenshot TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create subscription requests" ON subscription_requests
  FOR INSERT WITH CHECK (true);
          `);
          return false;
        } else {
          console.log('✅ Table created successfully via insert!');
          return true;
        }
      }
      return false;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log('📋 Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

testSubscriptionTable().then(success => {
  if (success) {
    console.log('🎉 Subscription table is ready!');
  } else {
    console.log('⚠️ Please create the table manually');
  }
  process.exit(success ? 0 : 1);
});
