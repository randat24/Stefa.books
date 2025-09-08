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

// Google Sheets configuration with Service Account
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

if (!GOOGLE_SHEETS_SPREADSHEET_ID || !GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY) {
  console.error('❌ Missing Google Sheets Service Account environment variables');
  console.log('Required variables:');
  console.log('- GOOGLE_SHEETS_SPREADSHEET_ID');
  console.log('- GOOGLE_SHEETS_CLIENT_EMAIL');
  console.log('- GOOGLE_SHEETS_PRIVATE_KEY');
  process.exit(1);
}

// Create JWT client for Google Sheets API
const jwtClient = new JWT({
  email: GOOGLE_SHEETS_CLIENT_EMAIL,
  key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

async function fetchGoogleSheetsData() {
  try {
    console.log('📥 Fetching data from Google Sheets using Service Account...');
    
    // Authorize the JWT client
    await jwtClient.authorize();
    
    // Get access token
    const accessToken = await jwtClient.getAccessToken();
    
    // Fetch data from Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/A:Z`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values;
    
    if (!rows || rows.length === 0) {
      console.log('❌ No data found in Google Sheets');
      return [];
    }
    
    console.log(`📊 Found ${rows.length} rows in Google Sheets`);
    
    // Debug: show header row to understand structure
    if (rows.length > 0) {
      console.log('\n📋 Header row (to understand structure):');
      const header = rows[0];
      header.forEach((col, index) => {
        const letter = String.fromCharCode(65 + index);
        console.log(`  ${letter}: "${col}"`);
      });
      console.log('');
    }
    
    // Parse data (skip header row)
    // Need to find which column contains cover URLs
    const books = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 11) {
        const book = {
          code: row[0]?.trim() || '',      // A: Код
          title: row[1]?.trim() || '',     // B: Назва
          author: row[2]?.trim() || '',    // C: Автор
          publisher: row[3]?.trim() || '', // D: Видавництво
          category: row[4]?.trim() || '',  // E: Категорія
          total: row[5]?.trim() || '',     // F: Всього
          available: row[6]?.trim() || '', // G: Доступно
          status: row[7]?.trim() || '',    // H: Статус
          price: row[8]?.trim() || '',     // I: Ціна
          fullPrice: row[9]?.trim() || '', // J: Повна ціна
          coverUrl: row[10]?.trim() || '', // K: cover_url
          description: row[11]?.trim() || '' // L: Опис
        };
        
        // Only include books with all required fields for cover update
        if (book.title && book.author && book.coverUrl && book.coverUrl.length > 0) {
          books.push(book);
        }
      }
    }
    
    console.log(`✅ Parsed ${books.length} valid books from Google Sheets`);
    
    // Show sample data
    console.log('\n📋 Sample data from Google Sheets:');
    books.slice(0, 3).forEach((book, index) => {
      console.log(`  ${index + 1}. [${book.code}] "${book.title}" by ${book.author}`);
      console.log(`     Cover: ${book.coverUrl}`);
    });
    
    return books;
    
  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error.message);
    if (error.message.includes('403')) {
      console.log('💡 Make sure the Service Account has access to the Google Sheet');
    }
    return [];
  }
}

// Function to check if Cloudinary image is accessible
async function checkImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Function to optimize Cloudinary URL
function optimizeImageUrl(url) {
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // If URL already has parameters, return as is
  if (url.includes('?')) {
    return url;
  }
  
  // Add optimization parameters
  return `${url}?f_auto,q_auto,w_400,h_600,c_fill`;
}

async function updateBookCovers() {
  console.log('\n🔄 Starting book covers update...\n');
  
  try {
    // Get data from Google Sheets
    const sheetsData = await fetchGoogleSheetsData();
    
    if (sheetsData.length === 0) {
      console.log('❌ No data to process');
      return;
    }
    
    // Get all books from database
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, cover_url');
    
    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      return;
    }
    
    console.log(`\n📚 Found ${books.length} books in database`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    let alreadyUpdatedCount = 0;
    let invalidUrlCount = 0;
    let errorCount = 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('Processing books...');
    console.log('='.repeat(60));
    
    // Update book covers
    for (const sheetBook of sheetsData) {
      try {
        console.log(`\n📖 Processing: "${sheetBook.title}" by ${sheetBook.author}`);
        
        // Find matching book in database
        const matchingBook = books.find(dbBook => 
          dbBook.title.toLowerCase().trim() === sheetBook.title.toLowerCase().trim() &&
          dbBook.author.toLowerCase().trim() === sheetBook.author.toLowerCase().trim()
        );
        
        if (!matchingBook) {
          console.log(`❓ Book not found in database`);
          notFoundCount++;
          continue;
        }
        
        // Check if image URL is accessible
        const isValidUrl = await checkImageUrl(sheetBook.coverUrl);
        if (!isValidUrl) {
          console.log(`❌ Invalid or inaccessible URL: ${sheetBook.coverUrl}`);
          invalidUrlCount++;
          continue;
        }
        
        // Optimize URL if it's Cloudinary
        const optimizedUrl = optimizeImageUrl(sheetBook.coverUrl);
        console.log(`🔗 Using URL: ${optimizedUrl}`);
        
        // Check if update is needed
        if (matchingBook.cover_url !== optimizedUrl) {
          const { error: updateError } = await supabase
            .from('books')
            .update({ cover_url: optimizedUrl })
            .eq('id', matchingBook.id);
          
          if (updateError) {
            console.error(`❌ Error updating: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Updated successfully`);
            console.log(`   Old: ${matchingBook.cover_url || 'null'}`);
            console.log(`   New: ${optimizedUrl}`);
            updatedCount++;
          }
        } else {
          console.log(`⏭️ Already up to date`);
          alreadyUpdatedCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error processing "${sheetBook.title}": ${error.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 IMPORT SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} books`);
    console.log(`⏭️ Already up to date: ${alreadyUpdatedCount} books`);
    console.log(`❓ Not found in database: ${notFoundCount} books`);
    console.log(`❌ Invalid URLs: ${invalidUrlCount} books`);
    console.log(`❌ Errors: ${errorCount} books`);
    console.log(`📊 Total processed: ${sheetsData.length} books from Google Sheets`);
    console.log('='.repeat(60));
    
    return {
      updated: updatedCount,
      alreadyUpdated: alreadyUpdatedCount,
      notFound: notFoundCount,
      invalid: invalidUrlCount,
      errors: errorCount,
      total: sheetsData.length
    };
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    return null;
  }
}

// Function to verify all book data
async function verifyBookData() {
  console.log('\n🔍 Verifying book data consistency...\n');
  
  try {
    // Get data from Google Sheets
    const sheetsData = await fetchGoogleSheetsData();
    
    if (sheetsData.length === 0) {
      console.log('❌ No Google Sheets data to verify against');
      return;
    }
    
    // Get all books from database
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, code, title, author, cover_url, price_uah, available');
    
    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      return;
    }
    
    console.log(`📊 Google Sheets: ${sheetsData.length} books`);
    console.log(`📊 Database: ${books.length} books`);
    
    // Find books that exist in sheets but not in database
    const missingInDb = sheetsData.filter(sheetBook => 
      !books.find(dbBook => 
        dbBook.title.toLowerCase().trim() === sheetBook.title.toLowerCase().trim() &&
        dbBook.author.toLowerCase().trim() === sheetBook.author.toLowerCase().trim()
      )
    );
    
    // Find books that exist in database but not in sheets
    const missingInSheets = books.filter(dbBook => 
      !sheetsData.find(sheetBook => 
        sheetBook.title.toLowerCase().trim() === dbBook.title.toLowerCase().trim() &&
        sheetBook.author.toLowerCase().trim() === dbBook.author.toLowerCase().trim()
      )
    );
    
    // Find books with missing covers
    const missingCovers = books.filter(book => !book.cover_url);
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 DATA VERIFICATION RESULTS:');
    console.log(`❓ Books in sheets but missing in database: ${missingInDb.length}`);
    console.log(`❓ Books in database but missing in sheets: ${missingInSheets.length}`);
    console.log(`🖼️ Books in database without covers: ${missingCovers.length}`);
    console.log('='.repeat(60));
    
    if (missingInDb.length > 0) {
      console.log('\n📋 Books in Google Sheets but missing in database:');
      missingInDb.slice(0, 10).forEach((book, index) => {
        console.log(`  ${index + 1}. "${book.title}" by ${book.author}`);
      });
      if (missingInDb.length > 10) {
        console.log(`  ... and ${missingInDb.length - 10} more`);
      }
    }
    
    if (missingCovers.length > 0) {
      console.log('\n🖼️ Books in database without covers:');
      missingCovers.slice(0, 10).forEach((book, index) => {
        console.log(`  ${index + 1}. "${book.title}" by ${book.author}`);
      });
      if (missingCovers.length > 10) {
        console.log(`  ... and ${missingCovers.length - 10} more`);
      }
    }
    
    return {
      sheetsTotal: sheetsData.length,
      dbTotal: books.length,
      missingInDb: missingInDb.length,
      missingInSheets: missingInSheets.length,
      missingCovers: missingCovers.length
    };
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    return null;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 Google Sheets Book Cover Updater (Service Account)\n');
  
  if (args.includes('--verify')) {
    console.log('🔍 Running verification mode...');
    await verifyBookData();
  } else if (args.includes('--test')) {
    console.log('🧪 Running test mode...');
    const data = await fetchGoogleSheetsData();
    console.log(`\n✅ Test completed. Found ${data.length} books.`);
  } else {
    console.log('📥 Running full update process...');
    
    // First verify data
    console.log('\n=== STEP 1: DATA VERIFICATION ===');
    const verification = await verifyBookData();
    
    if (verification && verification.sheetsTotal > 0) {
      console.log('\n=== STEP 2: UPDATE BOOK COVERS ===');
      const result = await updateBookCovers();
      
      if (result) {
        console.log('\n🎉 Process completed successfully!');
      } else {
        console.log('\n❌ Process failed');
      }
    } else {
      console.log('\n❌ Cannot proceed with update due to verification issues');
    }
  }
}

main().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});