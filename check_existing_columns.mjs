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

async function checkExistingColumns() {
  console.log('🔍 Checking existing columns in subscription_requests table...');
  
  try {
    // Try to insert with minimal fields to see what's available
    const minimalFields = {
      name: 'Test User',
      email: 'test@example.com'
    };
    
    console.log('📝 Trying minimal fields...');
    const { data, error } = await supabase
      .from('subscription_requests')
      .insert(minimalFields)
      .select();
    
    if (error) {
      console.log('❌ Minimal insert failed:', error.message);
      
      // Try with just name
      console.log('📝 Trying with just name...');
      const { data: nameData, error: nameError } = await supabase
        .from('subscription_requests')
        .insert({ name: 'Test User' })
        .select();
      
      if (nameError) {
        console.log('❌ Name insert failed:', nameError.message);
        
        // Try with just id
        console.log('📝 Trying with just id...');
        const { data: idData, error: idError } = await supabase
          .from('subscription_requests')
          .insert({})
          .select();
        
        if (idError) {
          console.log('❌ Empty insert failed:', idError.message);
          return false;
        } else {
          console.log('✅ Empty insert successful!');
          console.log('📋 Data:', idData);
          
          // Clean up
          if (idData && idData[0]) {
            await supabase
              .from('subscription_requests')
              .delete()
              .eq('id', idData[0].id);
            console.log('🧹 Test data cleaned up');
          }
          return true;
        }
      } else {
        console.log('✅ Name insert successful!');
        console.log('📋 Data:', nameData);
        
        // Clean up
        if (nameData && nameData[0]) {
          await supabase
            .from('subscription_requests')
            .delete()
            .eq('id', nameData[0].id);
          console.log('🧹 Test data cleaned up');
        }
        return true;
      }
    } else {
      console.log('✅ Minimal insert successful!');
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

checkExistingColumns().then(success => {
  if (success) {
    console.log('🎉 Column check successful!');
  } else {
    console.log('⚠️ Column check failed');
  }
  process.exit(success ? 0 : 1);
});
