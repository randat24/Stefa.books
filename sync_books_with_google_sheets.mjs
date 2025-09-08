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
    
    // Parse data
    const books = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 11) {
        const book = {
          // Maps to database fields according to DATABASE_DOCUMENTATION.md
          code: row[0]?.trim() || '',           // A: Код -> code
          title: row[1]?.trim() || '',          // B: Назва -> title
          author: row[2]?.trim() || '',         // C: Автор -> author
          publisher: row[3]?.trim() || '',      // D: Видавництво -> publisher
          category: row[4]?.trim() || '',       // E: Категорія -> category
          qty_total: parseInt(row[5]?.trim()) || 1,    // F: Всього -> qty_total
          qty_available: parseInt(row[6]?.trim()) || 1, // G: Доступно -> qty_available
          status: row[7]?.trim() || 'available', // H: Статус -> status
          price_uah: parseFloat(row[8]?.trim()) || null, // I: Ціна -> price_uah
          price_full: parseFloat(row[9]?.trim()) || null, // J: Повна ціна
          cover_url: row[10]?.trim() || '',     // K: cover_url -> cover_url
          description: row[11]?.trim() || '',   // L: Опис -> description
          
          // Set defaults according to database schema
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
  // Generate code like SB-2025-NNNN
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
  console.log('🔄 Starting full synchronization with Google Sheets...\n');
  
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
          dbBook.category !== sheetBook.category ||
          dbBook.publisher !== sheetBook.publisher ||
          dbBook.description !== sheetBook.description ||
          dbBook.cover_url !== sheetBook.cover_url ||
          dbBook.price_uah !== sheetBook.price_uah ||
          dbBook.qty_total !== sheetBook.qty_total ||
          dbBook.qty_available !== sheetBook.qty_available ||
          dbBook.status !== sheetBook.status;
        
        if (needsUpdate) {
          booksToUpdate.push({ sheet: sheetBook, db: dbBook });
        }\n      } else {\n        // Generate unique code if missing\n        if (!sheetBook.code) {\n          sheetBook.code = generateUniqueCode(sheetBook.title, existingCodes);\n        }\n        newBooks.push(sheetBook);\n      }\n    }\n    \n    // Find books to delete (in DB but not in Sheets)\n    const booksToDelete = dbBooks.filter(dbBook => {\n      return !sheetsBooks.find(sheetBook => {\n        if (sheetBook.code && dbBook.code === sheetBook.code) return true;\n        return normalizeString(dbBook.title) === normalizeString(sheetBook.title) &&\n               normalizeString(dbBook.author) === normalizeString(sheetBook.author);\n      });\n    });\n    \n    console.log('\\n📈 SYNC PLAN:');\n    console.log(`✅ Matched (no changes needed): ${matchedBooks.length - booksToUpdate.length} books`);\n    console.log(`🔄 To update: ${booksToUpdate.length} books`);\n    console.log(`➕ To add: ${newBooks.length} books`);\n    console.log(`🗑️ To delete: ${booksToDelete.length} books`);\n    \n    // Ask for confirmation in production\n    if (!process.argv.includes('--force')) {\n      console.log('\\n⚠️ This will make significant changes to your database!');\n      console.log('💡 Run with --force flag to execute the synchronization');\n      console.log('💡 Run with --preview flag to see detailed changes');\n      \n      if (process.argv.includes('--preview')) {\n        await showPreview(booksToUpdate, newBooks, booksToDelete);\n      }\n      \n      return;\n    }\n    \n    // Execute synchronization\n    let stats = {\n      updated: 0,\n      added: 0,\n      deleted: 0,\n      errors: 0\n    };\n    \n    // 1. Delete books not in Google Sheets\n    if (booksToDelete.length > 0) {\n      console.log(`\\n🗑️ Deleting ${booksToDelete.length} books not in Google Sheets...`);\n      \n      for (const book of booksToDelete) {\n        try {\n          const { error } = await supabase\n            .from('books')\n            .delete()\n            .eq('id', book.id);\n          \n          if (error) {\n            console.error(`❌ Error deleting \"${book.title}\": ${error.message}`);\n            stats.errors++;\n          } else {\n            console.log(`🗑️ Deleted: \"${book.title}\" by ${book.author}`);\n            stats.deleted++;\n          }\n        } catch (error) {\n          console.error(`❌ Error deleting \"${book.title}\": ${error.message}`);\n          stats.errors++;\n        }\n      }\n    }\n    \n    // 2. Update existing books\n    if (booksToUpdate.length > 0) {\n      console.log(`\\n🔄 Updating ${booksToUpdate.length} books...`);\n      \n      for (const { sheet: sheetBook, db: dbBook } of booksToUpdate) {\n        try {\n          const updateData = {\n            title: sheetBook.title,\n            author: sheetBook.author,\n            category: sheetBook.category,\n            publisher: sheetBook.publisher,\n            description: sheetBook.description,\n            cover_url: sheetBook.cover_url,\n            price_uah: sheetBook.price_uah,\n            qty_total: sheetBook.qty_total,\n            qty_available: sheetBook.qty_available,\n            available: sheetBook.available,\n            status: sheetBook.status,\n            updated_at: new Date().toISOString()\n          };\n          \n          // Only update code if it was missing\n          if (!dbBook.code && sheetBook.code) {\n            updateData.code = sheetBook.code;\n          }\n          \n          const { error } = await supabase\n            .from('books')\n            .update(updateData)\n            .eq('id', dbBook.id);\n          \n          if (error) {\n            console.error(`❌ Error updating \"${sheetBook.title}\": ${error.message}`);\n            stats.errors++;\n          } else {\n            console.log(`🔄 Updated: \"${sheetBook.title}\" by ${sheetBook.author}`);\n            stats.updated++;\n          }\n        } catch (error) {\n          console.error(`❌ Error updating \"${sheetBook.title}\": ${error.message}`);\n          stats.errors++;\n        }\n        \n        // Small delay to avoid overwhelming the database\n        await new Promise(resolve => setTimeout(resolve, 100));\n      }\n    }\n    \n    // 3. Add new books\n    if (newBooks.length > 0) {\n      console.log(`\\n➕ Adding ${newBooks.length} new books...`);\n      \n      for (const sheetBook of newBooks) {\n        try {\n          const insertData = {\n            code: sheetBook.code,\n            title: sheetBook.title,\n            author: sheetBook.author,\n            category: sheetBook.category,\n            publisher: sheetBook.publisher,\n            description: sheetBook.description || '',\n            cover_url: sheetBook.cover_url,\n            price_uah: sheetBook.price_uah,\n            qty_total: sheetBook.qty_total,\n            qty_available: sheetBook.qty_available,\n            available: sheetBook.available,\n            status: sheetBook.status,\n            language: sheetBook.language,\n            rating: sheetBook.rating,\n            rating_count: sheetBook.rating_count,\n            created_at: new Date().toISOString(),\n            updated_at: new Date().toISOString()\n          };\n          \n          const { error } = await supabase\n            .from('books')\n            .insert(insertData);\n          \n          if (error) {\n            console.error(`❌ Error adding \"${sheetBook.title}\": ${error.message}`);\n            stats.errors++;\n          } else {\n            console.log(`➕ Added: \"${sheetBook.title}\" by ${sheetBook.author}`);\n            stats.added++;\n          }\n        } catch (error) {\n          console.error(`❌ Error adding \"${sheetBook.title}\": ${error.message}`);\n          stats.errors++;\n        }\n        \n        // Small delay\n        await new Promise(resolve => setTimeout(resolve, 100));\n      }\n    }\n    \n    // Final summary\n    console.log('\\n' + '='.repeat(80));\n    console.log('📈 SYNCHRONIZATION COMPLETE:');\n    console.log(`✅ Updated: ${stats.updated} books`);\n    console.log(`➕ Added: ${stats.added} books`);\n    console.log(`🗑️ Deleted: ${stats.deleted} books`);\n    console.log(`❌ Errors: ${stats.errors} books`);\n    console.log(`📊 Total operations: ${stats.updated + stats.added + stats.deleted} books`);\n    console.log('='.repeat(80));\n    \n    if (stats.errors === 0) {\n      console.log('🎉 Synchronization completed successfully!');\n    } else {\n      console.log('⚠️ Synchronization completed with some errors. Please review the log.');\n    }\n    \n  } catch (error) {\n    console.error('❌ Synchronization failed:', error.message);\n    console.error('Stack trace:', error.stack);\n  }\n}\n\nasync function showPreview(booksToUpdate, newBooks, booksToDelete) {\n  console.log('\\n' + '='.repeat(80));\n  console.log('📋 DETAILED PREVIEW:');\n  console.log('='.repeat(80));\n  \n  if (booksToUpdate.length > 0) {\n    console.log(`\\n🔄 BOOKS TO UPDATE (${booksToUpdate.length}):`);\n    booksToUpdate.slice(0, 5).forEach(({ sheet, db }, index) => {\n      console.log(`${index + 1}. \"${sheet.title}\" by ${sheet.author}`);\n      console.log(`   Code: ${db.code || 'N/A'} → ${sheet.code || 'N/A'}`);\n      console.log(`   Category: ${db.category || 'N/A'} → ${sheet.category || 'N/A'}`);\n      console.log(`   Cover: ${db.cover_url ? '✅' : '❌'} → ${sheet.cover_url ? '✅' : '❌'}`);\n      console.log('');\n    });\n    if (booksToUpdate.length > 5) {\n      console.log(`   ... and ${booksToUpdate.length - 5} more`);\n    }\n  }\n  \n  if (newBooks.length > 0) {\n    console.log(`\\n➕ NEW BOOKS TO ADD (${newBooks.length}):`);\n    newBooks.slice(0, 5).forEach((book, index) => {\n      console.log(`${index + 1}. [${book.code}] \"${book.title}\" by ${book.author}`);\n      console.log(`   Category: ${book.category}`);\n      console.log(`   Cover: ${book.cover_url ? '✅ Has URL' : '❌ No URL'}`);\n      console.log('');\n    });\n    if (newBooks.length > 5) {\n      console.log(`   ... and ${newBooks.length - 5} more`);\n    }\n  }\n  \n  if (booksToDelete.length > 0) {\n    console.log(`\\n🗑️ BOOKS TO DELETE (${booksToDelete.length}):`);\n    booksToDelete.slice(0, 5).forEach((book, index) => {\n      console.log(`${index + 1}. [${book.code || 'NO_CODE'}] \"${book.title}\" by ${book.author}`);\n      console.log('');\n    });\n    if (booksToDelete.length > 5) {\n      console.log(`   ... and ${booksToDelete.length - 5} more`);\n    }\n  }\n}\n\n// Main function\nasync function main() {\n  const args = process.argv.slice(2);\n  \n  console.log('🔄 Books Synchronization with Google Sheets\\n');\n  \n  if (args.includes('--help')) {\n    console.log('📖 Usage:');\n    console.log('  node sync_books_with_google_sheets.mjs              # Show sync plan');\n    console.log('  node sync_books_with_google_sheets.mjs --preview    # Show detailed preview');\n    console.log('  node sync_books_with_google_sheets.mjs --force      # Execute synchronization');\n    console.log('  node sync_books_with_google_sheets.mjs --help       # Show this help');\n    return;\n  }\n  \n  await syncBooksWithGoogleSheets();\n}\n\nmain().then(() => {\n  console.log('\\n🎉 Process completed!');\n  process.exit(0);\n}).catch(error => {\n  console.error('❌ Process failed:', error.message);\n  process.exit(1);\n});