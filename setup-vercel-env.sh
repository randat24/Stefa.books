#!/bin/bash

echo "🔧 Настройка переменных окружения для Vercel..."

# Основные переменные Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL "https://mmymryhkfnexjurstkdx.supabase.co" production --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW1yeWhrZm5leGp1cnN0a2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTI1MzQsImV4cCI6MjA3MjgyODUzNH0.GnsYIrkwhXIR7GJz0o1ezqzQ28D44uzWIsjyKWUsGqc" production --yes
vercel env add SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW1yeWhrZm5leGp1cnN0a2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI1MjUzNCwiZXhwIjoyMDcyODI4NTM0fQ.ds_kIEbKX13VOMmbtM1Rgjn1N8qU0606HfbKcvetP50" production --yes

# Cloudinary
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME "dchx7vd97" production --yes
vercel env add CLOUDINARY_API_KEY "199182618272294" production --yes
vercel env add CLOUDINARY_API_SECRET "33RbR5pYwpCLi30EK5dx_e4ENjs" production --yes

# Monobank
vercel env add MONOBANK_TOKEN "uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY" production --yes

# Site configuration
vercel env add NEXT_PUBLIC_SITE_URL "https://stefa-books.com.ua" production --yes
vercel env add ADMIN_EMAIL "admin@stefa-books.com.ua" production --yes
vercel env add ADMIN_JWT_SECRET "qhpKmoB0sf4r/I0SURXQ3YfvP1aG/53xF27F9qJFwjGXzJAcb4CoZmQnyM4dCCu4vyQum39mZa53rceLAunvMA==" production --yes

echo "✅ Переменные окружения настроены!"