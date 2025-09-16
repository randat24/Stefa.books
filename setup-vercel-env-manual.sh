#!/bin/bash

echo "🔧 Настройка переменных окружения для Vercel..."

# Основные переменные Supabase
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production << 'EOF'
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW1yeWhrZm5leGp1cnN0a2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTI1MzQsImV4cCI6MjA3MjgyODUzNH0.GnsYIrkwhXIR7GJz0o1ezqzQ28D44uzWIsjyKWUsGqc
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production << 'EOF'
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW1yeWhrZm5leGp1cnN0a2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI1MjUzNCwiZXhwIjoyMDcyODI4NTM0fQ.ds_kIEbKX13VOMmbtM1Rgjn1N8qU0606HfbKcvetP50
EOF

# Cloudinary
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production << 'EOF'
dchx7vd97
EOF

vercel env add CLOUDINARY_API_KEY production << 'EOF'
199182618272294
EOF

vercel env add CLOUDINARY_API_SECRET production << 'EOF'
33RbR5pYwpCLi30EK5dx_e4ENjs
EOF

# Monobank
vercel env add MONOBANK_TOKEN production << 'EOF'
uSjulrJT5jqGnzy8lSQoasq04GRtKMo0myvxJk5D0EKY
EOF

# Site configuration
vercel env add NEXT_PUBLIC_SITE_URL production << 'EOF'
https://stefa-books.com.ua
EOF

vercel env add ADMIN_EMAIL production << 'EOF'
admin@stefa-books.com.ua
EOF

vercel env add ADMIN_JWT_SECRET production << 'EOF'
qhpKmoB0sf4r/I0SURXQ3YfvP1aG/53xF27F9qJFwjGXzJAcb4CoZmQnyM4dCCu4vyQum39mZa53rceLAunvMA==
EOF

echo "✅ Переменные окружения настроены!"