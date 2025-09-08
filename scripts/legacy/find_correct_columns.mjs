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

async function findCorrectColumns() {
  console.log('🔍 Finding correct columns in subscription_requests table...');
  
  try {
    // Try different field combinations based on the error messages
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      subscription_type: 'mini'  // This seems to be the correct field name
    };
    
    console.log('📝 Trying with subscription_type...');
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert(testData)
      .select();
    
    if (error) {
      console.log('❌ subscription_type insert failed:', error.message);
      
      // Try with different subscription_type values
      console.log('📝 Trying with different subscription_type values...');
      const values = ['mini', 'maxi', 'premium', 'basic', 'standard'];
      
      for (const value of values) {
        const { data: testData, error: testError } = await supabase
          .from('subscription_requests')
          .insert({
            name: 'Test User',
            email: 'test@example.com',
            subscription_type: value
          })
          .select();
        
        if (!testError) {
          console.log(`✅ subscription_type '${value}' works!`);
          console.log('📋 Data:', testData);
          
          // Clean up
          if (testData && testData[0]) {
            await supabase
              .from('subscription_requests')
              .delete()
              .eq('id', testData[0].id);
            console.log('🧹 Test data cleaned up');
          }
          return true;
        } else {
          console.log(`❌ subscription_type '${value}' failed:`, testError.message);
        }
      }
      
      return false;
    } else {
      console.log('✅ subscription_type insert successful!');
      console.log('📋 Data:', data);
      
      // Clean up
      if (data && data[0]) {
        await supabase
          .from('subscription_requests')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Test data cleaned up');
      }
      return true;
    }
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

findCorrectColumns().then(success => {
  if (success) {
    console.log('🎉 Found correct columns!');
  } else {
    console.log('⚠️ Could not find correct columns');
  }
  process.exit(success ? 0 : 1);
});
