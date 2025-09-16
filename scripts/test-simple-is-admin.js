const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleIsAdmin() {
  console.log('🧪 Testing simple is_admin function...\n');

  try {
    // Test with TEXT (should work)
    console.log('📊 Testing is_admin with TEXT:');
    const { data: textTest, error: textError } = await supabase
      .rpc('is_admin', { user_id: 'test-user-id' });

    if (textError) {
      console.error('❌ TEXT test failed:', textError.message);
    } else {
      console.log('✅ TEXT test passed:', textTest);
    }

    // Test with actual user ID if available
    console.log('\n📊 Testing with actual user data:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role')
      .limit(3);

    if (usersError) {
      console.error('❌ Could not fetch users:', usersError.message);
    } else {
      console.log('👥 Found users:', users?.length || 0);
      for (const user of users || []) {
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
        
        if (adminError) {
          console.error(`❌ Error testing user ${user.id}:`, adminError.message);
        } else {
          console.log(`   User ${user.id} (role: ${user.role}): is_admin = ${isAdmin}`);
        }
      }
    }

    console.log('\n🎉 Simple is_admin function test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSimpleIsAdmin();
