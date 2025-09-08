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
    
    // Parse data
    const books = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 11) {
        const book = {
          code: row[0]?.trim() || '',
          title: row[1]?.trim() || '',
          author: row[2]?.trim() || '',
          publisher: row[3]?.trim() || '',
          category: row[4]?.trim() || '',
          total: row[5]?.trim() || '',
          available: row[6]?.trim() || '',
          status: row[7]?.trim() || '',
          price: row[8]?.trim() || '',
          fullPrice: row[9]?.trim() || '',
          coverUrl: row[10]?.trim() || '',
          description: row[11]?.trim() || ''
        };
        
        if (book.title && book.author) {
          books.push(book);
        }
      }
    }
    
    console.log(`✅ Found ${books.length} books in Google Sheets`);
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
      .select('id, code, title, author, cover_url, price_uah, available');
    
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

function findMatches(sheetsBooks, dbBooks) {
  const matches = [];
  const unmatched = [];
  
  for (const sheetBook of sheetsBooks) {
    const normalizedSheetTitle = normalizeString(sheetBook.title);
    const normalizedSheetAuthor = normalizeString(sheetBook.author);
    
    // Try to find exact match
    let match = dbBooks.find(dbBook => 
      normalizeString(dbBook.title) === normalizedSheetTitle &&
      normalizeString(dbBook.author) === normalizedSheetAuthor
    );
    
    if (!match) {
      // Try to find by title only
      match = dbBooks.find(dbBook => 
        normalizeString(dbBook.title) === normalizedSheetTitle
      );
    }
    
    if (!match && sheetBook.code) {
      // Try to find by code
      match = dbBooks.find(dbBook => 
        dbBook.code === sheetBook.code
      );
    }
    
    if (match) {
      matches.push({
        sheet: sheetBook,
        db: match,
        matchType: match.title === sheetBook.title && match.author === sheetBook.author ? 'exact' :
                  match.title === sheetBook.title ? 'title' : 'code'
      });
    } else {
      unmatched.push(sheetBook);
    }
  }
  
  return { matches, unmatched };
}

async function compareData() {
  console.log('🔍 Comparing Google Sheets and Database data...\n');
  
  const sheetsBooks = await fetchGoogleSheetsData();
  const dbBooks = await fetchDatabaseBooks();
  
  if (sheetsBooks.length === 0 || dbBooks.length === 0) {
    console.log('❌ Cannot compare - missing data');
    return;
  }
  
  const { matches, unmatched } = findMatches(sheetsBooks, dbBooks);
  
  console.log('='.repeat(80));
  console.log('📊 COMPARISON RESULTS:');
  console.log(`📋 Google Sheets: ${sheetsBooks.length} books`);
  console.log(`🗄️ Database: ${dbBooks.length} books`);
  console.log(`✅ Matched: ${matches.length} books`);
  console.log(`❓ Unmatched (in sheets but not in DB): ${unmatched.length} books`);
  console.log('='.repeat(80));
  
  // Show matches
  if (matches.length > 0) {
    console.log('\n✅ MATCHED BOOKS (first 10):');
    matches.slice(0, 10).forEach((match, index) => {
      console.log(`${index + 1}. [${match.matchType.toUpperCase()}] "${match.sheet.title}"`);
      console.log(`   Sheet: by ${match.sheet.author} | Code: ${match.sheet.code || 'N/A'}`);
      console.log(`   DB:    by ${match.db.author} | Code: ${match.db.code || 'N/A'}`);
      console.log(`   Cover: ${match.sheet.coverUrl ? '✅ Has URL' : '❌ No URL'} → ${match.db.cover_url ? '✅ Has URL' : '❌ No URL'}`);
      console.log('');
    });
    
    if (matches.length > 10) {
      console.log(`   ... and ${matches.length - 10} more matches`);
    }
  }
  
  // Show unmatched
  if (unmatched.length > 0) {
    console.log('\n❓ UNMATCHED BOOKS (in sheets but not in database):');
    unmatched.slice(0, 15).forEach((book, index) => {
      console.log(`${index + 1}. [${book.code || 'NO_CODE'}] "${book.title}" by ${book.author}`);
      console.log(`   Category: ${book.category || 'N/A'} | Publisher: ${book.publisher || 'N/A'}`);
      console.log(`   Cover: ${book.coverUrl ? '✅ Has URL' : '❌ No URL'}`);
      console.log('');
    });
    
    if (unmatched.length > 15) {
      console.log(`   ... and ${unmatched.length - 15} more unmatched books`);
    }
  }
  
  // Analyze covers
  const sheetsWithCovers = sheetsBooks.filter(book => book.coverUrl && book.coverUrl.length > 0);
  const dbWithCovers = dbBooks.filter(book => book.cover_url && book.cover_url !== '/images/book-placeholder.svg');
  const matchesWithCovers = matches.filter(match => match.sheet.coverUrl && match.sheet.coverUrl.length > 0);
  
  console.log('\n📸 COVER ANALYSIS:');
  console.log(`📋 Books with covers in sheets: ${sheetsWithCovers.length}/${sheetsBooks.length}`);
  console.log(`🗄️ Books with covers in database: ${dbWithCovers.length}/${dbBooks.length}`);
  console.log(`🔗 Matched books with covers available: ${matchesWithCovers.length}/${matches.length}`);
  
  // Books that need cover updates
  const needsCoverUpdate = matchesWithCovers.filter(match => 
    match.sheet.coverUrl && 
    (!match.db.cover_url || match.db.cover_url === '/images/book-placeholder.svg' || match.db.cover_url !== match.sheet.coverUrl)
  );
  
  console.log(`🔄 Books that need cover updates: ${needsCoverUpdate.length}`);
  
  if (needsCoverUpdate.length > 0) {
    console.log('\n🔄 BOOKS NEEDING COVER UPDATES (first 10):');
    needsCoverUpdate.slice(0, 10).forEach((match, index) => {
      console.log(`${index + 1}. "${match.sheet.title}" by ${match.sheet.author}`);
      console.log(`   Current: ${match.db.cover_url || 'null'}`);
      console.log(`   New:     ${match.sheet.coverUrl}`);
      console.log('');
    });
  }
  
  return {
    totalSheets: sheetsBooks.length,
    totalDb: dbBooks.length,
    matched: matches.length,
    unmatched: unmatched.length,
    sheetsWithCovers: sheetsWithCovers.length,
    dbWithCovers: dbWithCovers.length,
    needsCoverUpdate: needsCoverUpdate.length,
    matches: matches,
    unmatched: unmatched,
    needsUpdate: needsCoverUpdate
  };
}

async function updateMatchedCovers() {
  console.log('\n🔄 Starting cover updates for matched books...\n');
  
  const sheetsBooks = await fetchGoogleSheetsData();
  const dbBooks = await fetchDatabaseBooks();
  
  const { matches } = findMatches(sheetsBooks, dbBooks);
  
  const needsUpdate = matches.filter(match => 
    match.sheet.coverUrl && 
    match.sheet.coverUrl.length > 0 &&
    (!match.db.cover_url || 
     match.db.cover_url === '/images/book-placeholder.svg' || 
     match.db.cover_url !== match.sheet.coverUrl)
  );
  
  console.log(`🔄 Found ${needsUpdate.length} books that need cover updates`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const match of needsUpdate) {
    try {
      console.log(`📖 Updating: "${match.sheet.title}" by ${match.sheet.author}`);
      
      // Optimize Cloudinary URL if needed
      let optimizedUrl = match.sheet.coverUrl;
      if (optimizedUrl.includes('cloudinary.com') && !optimizedUrl.includes('?')) {
        optimizedUrl = `${optimizedUrl}?f_auto,q_auto,w_400,h_600,c_fill`;
      }
      
      const { error: updateError } = await supabase
        .from('books')
        .update({ cover_url: optimizedUrl })
        .eq('id', match.db.id);
      
      if (updateError) {
        console.error(`❌ Error updating: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Updated successfully`);
        console.log(`   Old: ${match.db.cover_url || 'null'}`);
        console.log(`   New: ${optimizedUrl}`);
        updatedCount++;
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ Error processing "${match.sheet.title}": ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 UPDATE SUMMARY:');
  console.log(`✅ Updated: ${updatedCount} books`);
  console.log(`❌ Errors: ${errorCount} books`);
  console.log(`📊 Total processed: ${needsUpdate.length} books`);
  console.log('='.repeat(60));
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔍 Book Data Comparison Tool\n');
  
  if (args.includes('--update')) {
    console.log('🔄 Running update mode (will update covers for matched books)...');
    await updateMatchedCovers();
  } else {
    console.log('📊 Running comparison mode (analysis only)...');
    const results = await compareData();
    
    if (results && args.includes('--update-matched')) {
      console.log('\n🔄 Proceeding with cover updates...');
      await updateMatchedCovers();
    }
  }
}

main().then(() => {
  console.log('\n🎉 Analysis completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Process failed:', error.message);
  process.exit(1);
});