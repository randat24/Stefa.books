import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Создаем интерфейс для ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testGoogleSheetsUrl(url) {
  try {
    console.log(`🔍 Testing URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ URL not accessible (Status: ${response.status})`);
      return false;
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    console.log(`✅ URL is accessible! Found ${lines.length} lines`);
    
    if (lines.length > 1) {
      const firstRow = lines[1];
      console.log(`📋 Sample data: ${firstRow}`);
      
      // Проверяем, есть ли Cloudinary URL
      if (firstRow.includes('cloudinary.com')) {
        console.log('☁️ Found Cloudinary URLs in the data!');
        return true;
      } else {
        console.log('⚠️ No Cloudinary URLs found in the data');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error testing URL: ${error.message}`);
    return false;
  }
}

async function updateEnvFile(url) {
  try {
    let envContent = '';
    
    // Читаем существующий .env.local
    if (fs.existsSync('.env.local')) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }
    
    // Обновляем или добавляем GOOGLE_SHEETS_URL
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('GOOGLE_SHEETS_URL=')) {
        lines[i] = `GOOGLE_SHEETS_URL=${url}`;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      lines.push(`GOOGLE_SHEETS_URL=${url}`);
    }
    
    fs.writeFileSync('.env.local', lines.join('\n'));
    console.log('✅ Updated .env.local file');
    return true;
  } catch (error) {
    console.log(`❌ Error updating .env.local: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Cloudinary Covers Import Setup\n');
  
  console.log('This script will help you set up Google Sheets import for Cloudinary book covers.\n');
  
  console.log('📋 Requirements:');
  console.log('1. A Google Sheet with columns: Title | Author | Cloudinary URL');
  console.log('2. The sheet must be publicly accessible');
  console.log('3. Cloudinary URLs must be complete and valid');
  console.log('4. The sharing URL of the sheet\n');
  
  const sheetUrl = await askQuestion('🔗 Enter your Google Sheet sharing URL: ');
  
  if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
    console.log('❌ Invalid Google Sheets URL');
    rl.close();
    return;
  }
  
  // Извлекаем ID таблицы
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    console.log('❌ Could not extract sheet ID from URL');
    rl.close();
    return;
  }
  
  const sheetId = match[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  
  console.log(`\n📝 Extracted Sheet ID: ${sheetId}`);
  console.log(`🔗 CSV URL: ${csvUrl}`);
  
  // Тестируем URL
  const isValid = await testGoogleSheetsUrl(csvUrl);
  
  if (!isValid) {
    console.log('\n💡 Please check:');
    console.log('1. The sheet is shared publicly (Anyone with the link → Viewer)');
    console.log('2. The sheet has data in the correct format');
    console.log('3. The sheet contains Cloudinary URLs');
    console.log('4. The URL is correct');
    rl.close();
    return;
  }
  
  // Обновляем .env.local
  const envUpdated = await updateEnvFile(csvUrl);
  
  if (!envUpdated) {
    console.log('❌ Failed to update .env.local file');
    rl.close();
    return;
  }
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n🚀 Next steps:');
  console.log('1. Test the import: node import_cloudinary_covers.mjs --test');
  console.log('2. Show current covers: node import_cloudinary_covers.mjs --show');
  console.log('3. Run the import: node import_cloudinary_covers.mjs');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
