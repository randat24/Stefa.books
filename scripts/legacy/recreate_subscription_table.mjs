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

async function recreateSubscriptionTable() {
  console.log('🔧 Recreating subscription_requests table...');
  
  try {
    // First, try to drop the existing table if it exists
    console.log('🗑️ Dropping existing table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS subscription_requests CASCADE;'
    });
    
    if (dropError) {
      console.log('⚠️ Could not drop table via RPC:', dropError.message);
    } else {
      console.log('✅ Table dropped successfully');
    }
    
    // Create the table with correct structure
    console.log('🏗️ Creating new table...');
    const createTableSQL = `
      CREATE TABLE subscription_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        social VARCHAR(255),
        plan VARCHAR(20) NOT NULL CHECK (plan IN ('mini', 'maxi', 'premium')),
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('monobank', 'online', 'cash')),
        message TEXT,
        screenshot TEXT,
        privacy_consent BOOLEAN NOT NULL DEFAULT false,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.log('❌ Could not create table via RPC:', createError.message);
      console.log('Please create the table manually in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Table created successfully');
    
    // Enable RLS
    console.log('🔒 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️ Could not enable RLS:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // Create policies
    console.log('📋 Creating policies...');
    const policiesSQL = `
      -- Policy for public insert
      CREATE POLICY "Anyone can create subscription requests" ON subscription_requests
        FOR INSERT WITH CHECK (true);
      
      -- Policy for authenticated users to view their own requests
      CREATE POLICY "Users can view their own subscription requests" ON subscription_requests
        FOR SELECT USING (auth.uid() IS NOT NULL);
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: policiesSQL
    });
    
    if (policiesError) {
      console.log('⚠️ Could not create policies:', policiesError.message);
    } else {
      console.log('✅ Policies created');
    }
    
    // Test the table
    console.log('🧪 Testing table...');
    const { data, error: testError } = await supabase
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
    
    if (testError) {
      console.log('❌ Error testing table:', testError.message);
      return false;
    }
    
    console.log('✅ Table test successful!');
    
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

recreateSubscriptionTable().then(success => {
  if (success) {
    console.log('🎉 Subscription requests table is ready!');
  } else {
    console.log('⚠️ Please create the table manually in Supabase dashboard');
    console.log('Use the SQL script: create_subscription_requests_table.sql');
  }
  process.exit(success ? 0 : 1);
});
