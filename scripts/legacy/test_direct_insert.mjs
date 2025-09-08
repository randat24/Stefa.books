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

async function testDirectInsert() {
  console.log('🧪 Testing direct insert to subscription_requests...');
  
  try {
    // Try different combinations of fields to see what works
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+380123456789',
      privacy_consent: true
    };
    
    console.log('📝 Trying basic fields...');
    const { data: basicData, error: basicError } = await supabase
      .from('subscription_requests')
      .insert(testData)
      .select();
    
    if (basicError) {
      console.log('❌ Basic insert failed:', basicError.message);
      
      // Try with plan field
      console.log('📝 Trying with plan field...');
      const { data: planData, error: planError } = await supabase
        .from('subscription_requests')
        .insert({
          ...testData,
          plan: 'mini'
        })
        .select();
      
      if (planError) {
        console.log('❌ Plan insert failed:', planError.message);
        
        // Try with payment_method field
        console.log('📝 Trying with payment_method field...');
        const { data: paymentData, error: paymentError } = await supabase
          .from('subscription_requests')
          .insert({
            ...testData,
            plan: 'mini',
            payment_method: 'monobank'
          })
          .select();
        
        if (paymentError) {
          console.log('❌ Payment insert failed:', paymentError.message);
          
          // Try with all fields
          console.log('📝 Trying with all fields...');
          const { data: allData, error: allError } = await supabase
            .from('subscription_requests')
            .insert({
              name: 'Test User',
              email: 'test@example.com',
              phone: '+380123456789',
              social: '@testuser',
              plan: 'mini',
              payment_method: 'monobank',
              message: 'Test message',
              privacy_consent: true,
              status: 'pending'
            })
            .select();
          
          if (allError) {
            console.log('❌ All fields insert failed:', allError.message);
            return false;
          } else {
            console.log('✅ All fields insert successful!');
            console.log('📋 Data:', allData);
            
            // Clean up
            if (allData && allData[0]) {
              await supabase
                .from('subscription_requests')
                .delete()
                .eq('id', allData[0].id);
              console.log('🧹 Test data cleaned up');
            }
            return true;
          }
        } else {
          console.log('✅ Payment insert successful!');
          console.log('📋 Data:', paymentData);
          
          // Clean up
          if (paymentData && paymentData[0]) {
            await supabase
              .from('subscription_requests')
              .delete()
              .eq('id', paymentData[0].id);
            console.log('🧹 Test data cleaned up');
          }
          return true;
        }
      } else {
        console.log('✅ Plan insert successful!');
        console.log('📋 Data:', planData);
        
        // Clean up
        if (planData && planData[0]) {
          await supabase
            .from('subscription_requests')
            .delete()
            .eq('id', planData[0].id);
          console.log('🧹 Test data cleaned up');
        }
        return true;
      }
    } else {
      console.log('✅ Basic insert successful!');
      console.log('📋 Data:', basicData);
      
      // Clean up
      if (basicData && basicData[0]) {
        await supabase
          .from('subscription_requests')
          .delete()
          .eq('id', basicData[0].id);
        console.log('🧹 Test data cleaned up');
      }
      return true;
    }
  } catch (err) {
    console.error('❌ An unexpected error occurred:', err.message);
    return false;
  }
}

testDirectInsert().then(success => {
  if (success) {
    console.log('🎉 Direct insert test successful!');
  } else {
    console.log('⚠️ Direct insert test failed');
  }
  process.exit(success ? 0 : 1);
});
