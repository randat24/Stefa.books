import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('books')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log(`📚 Total books in database: ${data?.length || 0}`);
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
}

async function checkBooksData() {
  console.log('\n📚 Checking books data...');
  
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, author, cover_url, available, category_id')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching books:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${books?.length || 0} books (showing first 5):`);
    books?.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} by ${book.author}`);
      console.log(`     Cover: ${book.cover_url ? '✅' : '❌'}`);
      console.log(`     Available: ${book.available ? '✅' : '❌'}`);
      console.log(`     Category ID: ${book.category_id || 'None'}`);
      console.log('');
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error checking books:', err.message);
    return false;
  }
}

async function checkCategoriesData() {
  console.log('\n📂 Checking categories data...');
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching categories:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories (showing first 10):`);
    categories?.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.slug})`);
      console.log(`     Parent ID: ${category.parent_id || 'Root category'}`);
      console.log('');
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error checking categories:', err.message);
    return false;
  }
}

async function checkAuthorsData() {
  console.log('\n👤 Checking authors data...');
  
  try {
    const { data: authors, error } = await supabase
      .from('authors')
      .select('id, name, slug')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching authors:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${authors?.length || 0} authors (showing first 10):`);
    authors?.forEach((author, index) => {
      console.log(`  ${index + 1}. ${author.name} (${author.slug})`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error checking authors:', err.message);
    return false;
  }
}

async function checkImagesLoading() {
  console.log('\n🖼️ Checking image URLs...');
  
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, cover_url')
      .not('cover_url', 'is', null)
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching books with images:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${books?.length || 0} books with cover images:`);
    books?.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title}`);
      console.log(`     Image URL: ${book.cover_url}`);
      
      // Test if image URL is accessible
      try {
        const url = new URL(book.cover_url);
        console.log(`     Domain: ${url.hostname}`);
        console.log(`     Protocol: ${url.protocol}`);
      } catch (urlError) {
        console.log(`     ❌ Invalid URL format`);
      }
      console.log('');
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error checking images:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database connection check...\n');
  
  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Database connection failed. Please check your environment variables.');
    process.exit(1);
  }
  
  await checkBooksData();
  await checkCategoriesData();
  await checkAuthorsData();
  await checkImagesLoading();
  
  console.log('\n✅ Database check completed!');
}

main().catch(console.error);
