import { createClient } from '@supabase/supabase-js';
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

async function fixBookImages() {
  console.log('🔧 Fixing book cover URLs...');
  
  try {
    // Get all books with invalid cover URLs
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, title, cover_url')
      .or('cover_url.is.null,cover_url.like.*your-cloud*');
    
    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      return false;
    }
    
    console.log(`📚 Found ${books?.length || 0} books with invalid cover URLs`);
    
    if (!books || books.length === 0) {
      console.log('✅ No books need fixing');
      return true;
    }
    
    // Update cover URLs to placeholder
    const { error: updateError } = await supabase
      .from('books')
      .update({ cover_url: '/images/book-placeholder.svg' })
      .or('cover_url.is.null,cover_url.like.*your-cloud*');
    
    if (updateError) {
      console.error('❌ Error updating books:', updateError.message);
      return false;
    }
    
    console.log('✅ Successfully updated book cover URLs to placeholder');
    
    // Show some examples
    console.log('\n📖 Updated books:');
    books.slice(0, 5).forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title}`);
    });
    
    if (books.length > 5) {
      console.log(`  ... and ${books.length - 5} more books`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting book images fix...\n');
  
  const success = await fixBookImages();
  
  if (success) {
    console.log('\n✅ Book images fix completed successfully!');
  } else {
    console.log('\n❌ Book images fix failed!');
    process.exit(1);
  }
}

main().catch(console.error);
