#!/usr/bin/env node

/**
 * Simple script to update user role using fetch API
 * No external dependencies required
 */

const https = require('https');
const http = require('http');

// Read environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please check your .env.local file');
  process.exit(1);
}

async function updateUserRole(email, role) {
  try {
    console.log(`🔍 Updating user role for: ${email} to ${role}`);
    
    // Create the request data
    const postData = JSON.stringify({
      email: email,
      role: role
    });

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/admin/users/update-role',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ User role updated successfully!');
            console.log('Response:', response);
          } else {
            console.error('❌ Error updating user role:', response.error);
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Get command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.error('❌ Usage: node scripts/simple-update-role.js <email> <role>');
  console.error('Example: node scripts/simple-update-role.js admin@stefa-books.com.ua admin');
  process.exit(1);
}

if (!['user', 'admin', 'moderator'].includes(role)) {
  console.error('❌ Role must be one of: user, admin, moderator');
  process.exit(1);
}

// Run the update
updateUserRole(email, role);
