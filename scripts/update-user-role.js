#!/usr/bin/env node

/**
 * Script to update user role to admin
 * Usage: node scripts/update-user-role.js <email> <role>
 * Example: node scripts/update-user-role.js admin@stefa-books.com.ua admin
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateUserRole(email, role) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // First, check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError.message)
      return
    }

    if (!existingUser) {
      console.error(`❌ User with email ${email} not found`)
      return
    }

    console.log(`✅ User found:`, {
      id: existingUser.id,
      email: existingUser.email,
      currentRole: existingUser.role || 'user',
      firstName: existingUser.first_name,
      lastName: existingUser.last_name
    })

    // Update user role
    console.log(`🔄 Updating role to: ${role}`)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('❌ Error updating user role:', error.message)
      return
    }

    console.log('✅ User role updated successfully!')
    console.log('Updated user:', data[0])

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get command line arguments
const email = process.argv[2]
const role = process.argv[3]

if (!email || !role) {
  console.error('❌ Usage: node scripts/update-user-role.js <email> <role>')
  console.error('Example: node scripts/update-user-role.js admin@stefa-books.com.ua admin')
  process.exit(1)
}

if (!['user', 'admin', 'moderator'].includes(role)) {
  console.error('❌ Role must be one of: user, admin, moderator')
  process.exit(1)
}

// Run the update
updateUserRole(email, role)
