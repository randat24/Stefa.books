#!/bin/bash

# Fix subscription_requests columns issue
echo "🔧 Fixing subscription_requests columns..."

# Check if we can connect to Supabase
if command -v supabase &> /dev/null; then
    echo "📊 Running column fix via Supabase..."
    supabase db reset --linked
else
    echo "❌ Supabase CLI not found. Please run the SQL manually:"
    echo "1. Connect to your Supabase database"
    echo "2. Run the contents of fix_subscription_requests_columns.sql"
    echo ""
    echo "Or install Supabase CLI and run:"
    echo "npm install -g supabase"
    echo "supabase link"
    echo "supabase db reset --linked"
fi
