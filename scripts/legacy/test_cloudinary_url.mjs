import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Функция для проверки доступности Cloudinary изображения
async function checkCloudinaryImage(url) {
  try {
    console.log(`🔍 Checking URL: ${url}`);
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Функция для оптимизации Cloudinary URL
function optimizeCloudinaryUrl(url) {
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // Если URL уже содержит параметры, возвращаем как есть
  if (url.includes('?')) {
    return url;
  }
  
  // Добавляем параметры для оптимизации
  return `${url}?f_auto,q_auto,w_400,h_600,c_fill`;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('💡 Usage: node test_cloudinary_url.mjs <cloudinary_url>');
    console.log('Example: node test_cloudinary_url.mjs "https://res.cloudinary.com/dchx7vd97/image/upload/v1234567890/book-cover.jpg"');
    process.exit(1);
  }
  
  const url = args[0];
  
  console.log('🧪 Testing Cloudinary URL...\n');
  
  console.log(`📋 Original URL: ${url}`);
  
  const optimizedUrl = optimizeCloudinaryUrl(url);
  console.log(`🔗 Optimized URL: ${optimizedUrl}`);
  
  console.log('\n🔍 Testing original URL...');
  const originalValid = await checkCloudinaryImage(url);
  
  console.log('\n🔍 Testing optimized URL...');
  const optimizedValid = await checkCloudinaryImage(optimizedUrl);
  
  console.log('\n📈 Results:');
  console.log(`Original URL: ${originalValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Optimized URL: ${optimizedValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (optimizedValid) {
    console.log('\n🎉 Cloudinary URL is working! You can use it in your Google Sheets.');
  } else {
    console.log('\n⚠️ Cloudinary URL is not accessible. Please check:');
    console.log('1. URL is correct');
    console.log('2. Image exists in Cloudinary');
    console.log('3. Image is publicly accessible');
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
