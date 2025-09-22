#!/bin/bash

# Create .env.local file with Supabase credentials
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cgamjdljbpatvnnlhade.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYW1qZGxqYnBhdHZubmxoYWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Nzc3MzIsImV4cCI6MjA3MzU1MzczMn0.73YHU_A9KaADMrgCm-zofYYDM_Z7rlusp3K5zGc3Nfg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYW1qZGxqYnBhdHZubmxoYWRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk3NzczMiwiZXhwIjoyMDczNTUzNzMyfQ.sSFfN2wkZukBdNjYYqOrsLi_ovwP8Q66BqkL8b-o9-g
SUPABASE_JWT_SECRET=b5OEY5TfvJmvUl8EvibjSpFGtRSIfRYj4SbnKsm19KJelh9TIGnR5OscbeDgFYyPxZZb2naBlQw8orIRTheRTw==

# Database Configuration
POSTGRES_URL=postgres://postgres.cgamjdljbpatvnnlhade:mqCTBJxohDCuzOgV@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgres://postgres.cgamjdljbpatvnnlhade:mqCTBJxohDCuzOgV@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://postgres.cgamjdljbpatvnnlhade:mqCTBJxohDCuzOgV@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
POSTGRES_HOST=db.cgamjdljbpatvnnlhade.supabase.co
POSTGRES_PASSWORD=mqCTBJxohDCuzOgV
POSTGRES_DATABASE=postgres

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Optional: Debug
DEBUG=true
LOG_LEVEL=debug
EOF

echo "✅ Created .env.local with Supabase credentials"
echo "🔒 IMPORTANT: Keep these credentials secure and NEVER commit .env.local to git"
