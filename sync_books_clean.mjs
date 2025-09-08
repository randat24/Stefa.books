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
          publisher: row[3]?.trim() || '',      // D: Видавництво
          category: row[4]?.trim() || '',       // E: Категорія
          qty_total: parseInt(row[5]?.trim()) || 1,    // F: Всього
          qty_available: parseInt(row[6]?.trim()) || 1, // G: Доступно
          status: row[7]?.trim() || 'available', // H: Статус
          price_uah: parseFloat(row[8]?.trim()) || null, // I: Ціна
          price_full: parseFloat(row[9]?.trim()) || null, // J: Повна ціна
          cover_url: row[10]?.trim() || '',     // K: cover_url
          description: row[11]?.trim() || '',   // L: Опис
          
          // Set defaults
          available: (parseInt(row[6]?.trim()) || 0) > 0,
          language: 'uk',
          rating: 0,
          rating_count: 0
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

async function fetchDatabaseBooks() {
  try {
    console.log('📥 Fetching data from database...');
    
    const { data: books, error } = await supabase
      .from('books')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Found ${books.length} books in database`);
    return books;
    
  } catch (error) {
    console.error('❌ Error fetching database books:', error.message);
    return [];
  }
}

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[«»""'']/g, '"')
    .replace(/[–—]/g, '-');
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

async function syncBooksWithGoogleSheets() {
  console.log('🔄 Starting synchronization analysis...\n');
  
  try {
    // Fetch data from both sources
    const sheetsBooks = await fetchGoogleSheetsData();
    const dbBooks = await fetchDatabaseBooks();
    
    if (sheetsBooks.length === 0) {
      console.log('❌ No Google Sheets data to sync');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SYNCHRONIZATION ANALYSIS:');
    console.log(`📋 Google Sheets: ${sheetsBooks.length} books`);
    console.log(`🗄️ Database: ${dbBooks.length} books`);
    console.log('='.repeat(80));
    
    // Find matches and differences
    const existingCodes = dbBooks.map(book => book.code).filter(Boolean);
    const matchedBooks = [];
    const newBooks = [];
    const booksToUpdate = [];
    
    for (const sheetBook of sheetsBooks) {
      const dbBook = dbBooks.find(db => {
        // Try to match by code first, then by title+author
        if (sheetBook.code && db.code === sheetBook.code) return true;
        return normalizeString(db.title) === normalizeString(sheetBook.title) &&
               normalizeString(db.author) === normalizeString(sheetBook.author);
      });
      
      if (dbBook) {
        matchedBooks.push({ sheet: sheetBook, db: dbBook });
        
        // Check if update is needed
        const needsUpdate = 
          dbBook.title !== sheetBook.title ||
          dbBook.author !== sheetBook.author ||
          (dbBook.subcategory || '') !== sheetBook.category ||
          (dbBook.publisher || '') !== sheetBook.publisher ||
          (dbBook.description || '') !== sheetBook.description ||
          dbBook.cover_url !== sheetBook.cover_url ||
          dbBook.price_uah !== sheetBook.price_uah ||
          dbBook.qty_total !== sheetBook.qty_total ||
          dbBook.qty_available !== sheetBook.qty_available ||
          dbBook.status !== sheetBook.status;
        
        if (needsUpdate) {
          booksToUpdate.push({ sheet: sheetBook, db: dbBook });
        }
      } else {
        // Generate unique code if missing
        if (!sheetBook.code) {
          sheetBook.code = generateUniqueCode(sheetBook.title, existingCodes);
        }
        newBooks.push(sheetBook);
      }
    }
    
    // Find books to delete (in DB but not in Sheets)
    const booksToDelete = dbBooks.filter(dbBook => {
      return !sheetsBooks.find(sheetBook => {
        if (sheetBook.code && dbBook.code === sheetBook.code) return true;
        return normalizeString(dbBook.title) === normalizeString(sheetBook.title) &&
               normalizeString(dbBook.author) === normalizeString(sheetBook.author);
      });
    });
    
    console.log('\n📈 SYNC PLAN:');
    console.log(`✅ Matched (no changes needed): ${matchedBooks.length - booksToUpdate.length} books`);
    console.log(`🔄 To update: ${booksToUpdate.length} books`);
    console.log(`➕ To add: ${newBooks.length} books`);
    console.log(`🗑️ To delete: ${booksToDelete.length} books`);
    
    // Show preview if requested
    if (process.argv.includes('--preview')) {
      await showPreview(booksToUpdate, newBooks, booksToDelete);
    }
    
    // Ask for confirmation
    if (!process.argv.includes('--force')) {
      console.log('\n⚠️ This will make significant changes to your database!');
      console.log('💡 Run with --force flag to execute the synchronization');
      console.log('💡 Run with --preview flag to see detailed changes');
      return;
    }
    
    // Execute synchronization
    console.log('\n🚀 EXECUTING SYNCHRONIZATION...\n');
    
    let stats = {
      updated: 0,
      added: 0,
      deleted: 0,
      errors: 0
    };
    
    // 1. Delete books not in Google Sheets
    if (booksToDelete.length > 0) {
      console.log(`🗑️ Deleting ${booksToDelete.length} books not in Google Sheets...`);
      
      for (const book of booksToDelete) {
        try {
          const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', book.id);
          
          if (error) {
            console.error(`❌ Error deleting "${book.title}": ${error.message}`);
            stats.errors++;
          } else {
            console.log(`🗑️ Deleted: "${book.title}" by ${book.author}`);
            stats.deleted++;
          }
        } catch (error) {
          console.error(`❌ Error deleting "${book.title}": ${error.message}`);
          stats.errors++;
        }
      }
    }
    
    // 2. Update existing books
    if (booksToUpdate.length > 0) {
      console.log(`\n🔄 Updating ${booksToUpdate.length} books...`);
      
      for (const { sheet: sheetBook, db: dbBook } of booksToUpdate) {
        try {
          const updateData = {
            title: sheetBook.title,
            author: sheetBook.author,
            subcategory: sheetBook.category, // Use subcategory field
            publisher: sheetBook.publisher,
            description: sheetBook.description,
            cover_url: sheetBook.cover_url,
            price_uah: sheetBook.price_uah,
            qty_total: sheetBook.qty_total,
            qty_available: sheetBook.qty_available,
            available: sheetBook.available,
            status: sheetBook.status,
            updated_at: new Date().toISOString()
          };
          
          // Only update code if it was missing
          if (!dbBook.code && sheetBook.code) {
            updateData.code = sheetBook.code;
          }
          
          const { error } = await supabase
            .from('books')
            .update(updateData)
            .eq('id', dbBook.id);
          
          if (error) {
            console.error(`❌ Error updating "${sheetBook.title}": ${error.message}`);
            stats.errors++;
          } else {
            console.log(`🔄 Updated: "${sheetBook.title}" by ${sheetBook.author}`);
            stats.updated++;
          }
        } catch (error) {
          console.error(`❌ Error updating "${sheetBook.title}": ${error.message}`);
          stats.errors++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 3. Add new books
    if (newBooks.length > 0) {
      console.log(`\n➕ Adding ${newBooks.length} new books...`);
      
      for (const sheetBook of newBooks) {
        try {
          const insertData = {
            code: sheetBook.code,
            title: sheetBook.title,
            author: sheetBook.author,
            subcategory: sheetBook.category, // Use subcategory field
            publisher: sheetBook.publisher,
            description: sheetBook.description || '',
            cover_url: sheetBook.cover_url,
            price_uah: sheetBook.price_uah,
            qty_total: sheetBook.qty_total,
            qty_available: sheetBook.qty_available,
            available: sheetBook.available,
            status: sheetBook.status,
            language: sheetBook.language,
            rating: sheetBook.rating,
            rating_count: sheetBook.rating_count,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
    }
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 SYNCHRONIZATION COMPLETE:');
    console.log(`✅ Updated: ${stats.updated} books`);
    console.log(`➕ Added: ${stats.added} books`);
    console.log(`🗑️ Deleted: ${stats.deleted} books`);
    console.log(`❌ Errors: ${stats.errors} books`);
    console.log(`📊 Total operations: ${stats.updated + stats.added + stats.deleted} books`);
    console.log('='.repeat(80));
    
    if (stats.errors === 0) {
      console.log('🎉 Synchronization completed successfully!');
    } else {
      console.log('⚠️ Synchronization completed with some errors. Please review the log.');
    }
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function showPreview(booksToUpdate, newBooks, booksToDelete) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETAILED PREVIEW:');
  console.log('='.repeat(80));
  
  if (booksToUpdate.length > 0) {
    console.log(`\n🔄 BOOKS TO UPDATE (${booksToUpdate.length}):`);
    booksToUpdate.slice(0, 5).forEach(({ sheet, db }, index) => {
      console.log(`${index + 1}. "${sheet.title}" by ${sheet.author}`);
      console.log(`   Code: ${db.code || 'N/A'} → ${sheet.code || 'N/A'}`);
      console.log(`   Category: ${db.subcategory || 'N/A'} → ${sheet.category || 'N/A'}`);
      console.log(`   Cover: ${db.cover_url ? '✅' : '❌'} → ${sheet.cover_url ? '✅' : '❌'}`);
      console.log('');
    });
    if (booksToUpdate.length > 5) {
      console.log(`   ... and ${booksToUpdate.length - 5} more`);
    }
  }
  
  if (newBooks.length > 0) {
    console.log(`\n➕ NEW BOOKS TO ADD (${newBooks.length}):`);
    newBooks.slice(0, 5).forEach((book, index) => {
      console.log(`${index + 1}. [${book.code}] "${book.title}" by ${book.author}`);
      console.log(`   Category: ${book.category}`);
      console.log(`   Cover: ${book.cover_url ? '✅ Has URL' : '❌ No URL'}`);
      console.log('');
    });
    if (newBooks.length > 5) {
      console.log(`   ... and ${newBooks.length - 5} more`);
    }
  }
  
  if (booksToDelete.length > 0) {
    console.log(`\n🗑️ BOOKS TO DELETE (${booksToDelete.length}):`);
    booksToDelete.slice(0, 5).forEach((book, index) => {
      console.log(`${index + 1}. [${book.code || 'NO_CODE'}] "${book.title}" by ${book.author}`);
      console.log('');
    });
    if (booksToDelete.length > 5) {
      console.log(`   ... and ${booksToDelete.length - 5} more`);
    }
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔄 Books Synchronization with Google Sheets\n');
  
  if (args.includes('--help')) {
    console.log('📖 Usage:');
    console.log('  node sync_books_clean.mjs              # Show sync plan');
    console.log('  node sync_books_clean.mjs --preview    # Show detailed preview');
    console.log('  node sync_books_clean.mjs --force      # Execute synchronization');
    console.log('  node sync_books_clean.mjs --help       # Show this help');
    return;
  }
  
  await syncBooksWithGoogleSheets();
}

main().then(() => {
  console.log('\n🎉 Process completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});