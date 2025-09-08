import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🔧 Google Sheets Setup Helper\n');
  
  console.log('📋 To set up Google Sheets integration, follow these steps:\n');
  
  console.log('1. 📊 Create a Google Sheet with these columns:');
  console.log('   Column A: Book Title (Название книги)');
  console.log('   Column B: Author (Автор)');
  console.log('   Column C: Cloudinary URL (Ссылка на обложку)');
  console.log('');
  
  console.log('2. 🔗 Make the sheet public:');
  console.log('   - Click "Share" button in Google Sheets');
  console.log('   - Set to "Anyone with the link" → "Viewer"');
  console.log('   - Copy the sharing link');
  console.log('');
  
  console.log('3. 📝 Extract the Sheet ID from the URL:');
  console.log('   URL format: https://docs.google.com/spreadsheets/d/SHEET_ID/edit');
  console.log('   Example: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  console.log('');
  
  console.log('4. ⚙️ Update your .env.local file:');
  console.log('   GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0');
  console.log('');
  
  console.log('5. 🧪 Test the connection:');
  console.log('   node update_book_covers_from_cloudinary_sheets.mjs --test');
  console.log('');
  
  console.log('6. 🚀 Update book covers:');
  console.log('   node update_book_covers_from_cloudinary_sheets.mjs');
  console.log('');
  
  console.log('💡 Tips:');
  console.log('- Make sure Cloudinary URLs are complete and accessible');
  console.log('- Test URLs with: node test_cloudinary_url.mjs "YOUR_URL"');
  console.log('- The script will automatically optimize Cloudinary URLs for better quality');
  console.log('');
  
  // Проверяем текущую конфигурацию
  const currentUrl = process.env.GOOGLE_SHEETS_URL;
  if (currentUrl && currentUrl !== 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0') {
    console.log('✅ Current configuration:');
    console.log(`   GOOGLE_SHEETS_URL: ${currentUrl}`);
    console.log('');
    console.log('🧪 Testing current configuration...');
    
    try {
      const response = await fetch(currentUrl);
      if (response.ok) {
        console.log('✅ Google Sheets is accessible!');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        console.log(`📊 Found ${lines.length - 1} data rows (excluding header)`);
        
        if (lines.length > 1) {
          const firstRow = lines[1].split(',').map(col => col.trim().replace(/^"|"$/g, ''));
          console.log('📋 Sample data:');
          console.log(`   Title: ${firstRow[0] || 'N/A'}`);
          console.log(`   Author: ${firstRow[1] || 'N/A'}`);
          console.log(`   Cover URL: ${firstRow[2] || 'N/A'}`);
        }
      } else {
        console.log(`❌ Google Sheets is not accessible (Status: ${response.status})`);
        console.log('💡 Please check the URL and sharing settings');
      }
    } catch (error) {
      console.log(`❌ Error testing Google Sheets: ${error.message}`);
    }
  } else {
    console.log('⚠️ No Google Sheets URL configured yet');
    console.log('💡 Please set GOOGLE_SHEETS_URL in your .env.local file');
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
