const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIsAdminFunction() {
  console.log('🧪 Testing is_admin function...\n');

  try {
    // Test with BIGINT (auth.uid() format)
    console.log('📊 Testing is_admin with BIGINT:');
    const { data: bigintTest, error: bigintError } = await supabase
      .rpc('is_admin', { user_id: 123456789 });

    if (bigintError) {
      console.error('❌ BIGINT test failed:', bigintError.message);
    } else {
      console.log('✅ BIGINT test passed:', bigintTest);
    }

    // Test with UUID
    console.log('\n📊 Testing is_admin with UUID:');
    const { data: uuidTest, error: uuidError } = await supabase
      .rpc('is_admin', { user_id: '123e4567-e89b-12d3-a456-426614174000' });

    if (uuidError) {
      console.error('❌ UUID test failed:', uuidError.message);
    } else {
      console.log('✅ UUID test passed:', uuidTest);
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
        // Test with UUID format
        const { data: isAdminUuid, error: adminUuidError } = await supabase
          .rpc('is_admin', { user_id: user.id });
        
        if (adminUuidError) {
          console.error(`❌ Error testing user ${user.id} (UUID):`, adminUuidError.message);
        } else {
          console.log(`   User ${user.id} (role: ${user.role}): is_admin = ${isAdminUuid}`);
        }

        // Test with BIGINT format (convert UUID to number for testing)
        try {
          const userIdAsNumber = parseInt(user.id.replace(/-/g, '').substring(0, 15), 16);
          const { data: isAdminBigint, error: adminBigintError } = await supabase
            .rpc('is_admin', { user_id: userIdAsNumber });
          
          if (adminBigintError) {
            console.log(`   User ${user.id} (BIGINT): ${adminBigintError.message}`);
          } else {
            console.log(`   User ${user.id} (BIGINT): is_admin = ${isAdminBigint}`);
          }
        } catch (e) {
          console.log(`   User ${user.id} (BIGINT): Could not convert to number`);
        }
      }
    }

    console.log('\n🎉 is_admin function test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testIsAdminFunction();
