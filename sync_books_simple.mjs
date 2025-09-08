import { createClient } from '@supabase/supabase-js';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Google Sheets configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

// Create JWT client for Google Sheets API
const jwtClient = new JWT({
  email: GOOGLE_SHEETS_CLIENT_EMAIL,
  key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

async function fetchGoogleSheetsData() {
  try {
    console.log('📥 Fetching data from Google Sheets...');
    
    await jwtClient.authorize();
    const accessToken = await jwtClient.getAccessToken();
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/A:Z`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }
    
    console.log(`📊 Found ${rows.length} rows in Google Sheets`);
    
    // Parse data (according to the structure we found earlier)
    const books = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 11) {
        const book = {
          code: row[0]?.trim() || '',           // A: Код
          title: row[1]?.trim() || '',          // B: Назва
          author: row[2]?.trim() || '',         // C: Автор
          // publisher: row[3]?.trim() || '',      // D: Видавництво (not exists in DB)
          subcategory: row[4]?.trim() || '',    // E: Категорія -> subcategory
          qty_total: parseInt(row[5]?.trim()) || 1,    // F: Всього
          qty_available: parseInt(row[6]?.trim()) || 1, // G: Доступно
          status: row[7]?.trim() || 'available', // H: Статус
          price_uah: parseFloat(row[8]?.trim()) || null, // I: Ціна
          // price_full: parseFloat(row[9]?.trim()) || null, // J: Повна ціна (not using)
          cover_url: row[10]?.trim() || '',     // K: cover_url
          description: row[11]?.trim() || '',   // L: Опис
          
          // Set defaults
          available: (parseInt(row[6]?.trim()) || 0) > 0
        };
        
        // Only include books with required fields
        if (book.title && book.author) {
          // Optimize Cloudinary URL if present
          if (book.cover_url && book.cover_url.includes('cloudinary.com') && !book.cover_url.includes('?')) {
            book.cover_url = `${book.cover_url}?f_auto,q_auto,w_400,h_600,c_fill`;
          }
          
          books.push(book);
        }
      }
    }
    
    console.log(`✅ Parsed ${books.length} valid books from Google Sheets`);
    return books;
    
  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error.message);
    return [];
  }
}

function generateUniqueCode(title, existingCodes) {
  const year = new Date().getFullYear();
  let counter = 1;
  let code;
  
  do {
    code = `SB-${year}-${counter.toString().padStart(4, '0')}`;
    counter++;
  } while (existingCodes.includes(code));
  
  existingCodes.push(code);
  return code;
}

async function addBooksFromGoogleSheets() {
  console.log('🔄 Adding books from Google Sheets...\n');
  
  try {
    // Fetch data from Google Sheets
    const sheetsBooks = await fetchGoogleSheetsData();
    
    if (sheetsBooks.length === 0) {
      console.log('❌ No Google Sheets data to add');
      return;
    }
    
    // Get existing books to check for codes
    const { data: existingBooks } = await supabase
      .from('books')
      .select('code')
      .not('code', 'is', null);
    
    const existingCodes = (existingBooks || []).map(book => book.code);
    
    console.log(`📊 Adding ${sheetsBooks.length} books from Google Sheets`);
    
    let stats = {
      added: 0,
      errors: 0
    };
    
    for (const sheetBook of sheetsBooks) {
      try {
        // Generate unique code if missing
        if (!sheetBook.code) {
          sheetBook.code = generateUniqueCode(sheetBook.title, existingCodes);
        }
        
        // Only use fields that exist in the database
        const insertData = {
          code: sheetBook.code,
          title: sheetBook.title,
          author: sheetBook.author,
          subcategory: sheetBook.subcategory,
          description: sheetBook.description || null,
          cover_url: sheetBook.cover_url || null,
          price_uah: sheetBook.price_uah,
          qty_total: sheetBook.qty_total,
          qty_available: sheetBook.qty_available,
          available: sheetBook.available,
          status: sheetBook.status
        };
        
        const { error } = await supabase
          .from('books')
          .insert(insertData);
        
        if (error) {
          console.error(`❌ Error adding "${sheetBook.title}": ${error.message}`);
          stats.errors++;
        } else {
          console.log(`➕ Added: "${sheetBook.title}" by ${sheetBook.author}`);
          stats.added++;
        }
      } catch (error) {
        console.error(`❌ Error adding "${sheetBook.title}": ${error.message}`);
        stats.errors++;
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 IMPORT COMPLETE:');
    console.log(`➕ Added: ${stats.added} books`);
    console.log(`❌ Errors: ${stats.errors} books`);
    console.log(`📊 Total processed: ${sheetsBooks.length} books`);
    console.log('='.repeat(80));
    
    if (stats.errors === 0) {
      console.log('🎉 All books imported successfully!');
    } else {
      console.log('⚠️ Import completed with some errors. Please review the log.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Main function
async function main() {
  console.log('📚 Simple Books Import from Google Sheets\n');
  
  if (process.argv.includes('--help')) {
    console.log('📖 Usage:');
    console.log('  node sync_books_simple.mjs    # Add all books from Google Sheets');
    return;
  }
  
  await addBooksFromGoogleSheets();
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});