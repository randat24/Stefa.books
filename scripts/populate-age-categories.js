const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Age category mapping based on book titles and descriptions
const ageCategoryMapping = {
  // Найменші (0-2 роки)
  'naymenshi-0-2': [
    'малюк', 'малюки', 'найменші', '0-2', '0-3', 'перші', 'перша', 'початкові',
    'розвиток', 'розвиваючі', 'розвивальні', 'іграшки', 'іграшкові'
  ],
  
  // Дошкільний вік (3-5 років)
  'doshkilnyy-3-5': [
    'дошкільний', 'дошкільнята', '3-5', '4-5', 'маленькі', 'маленька',
    'казки', 'казкові', 'казка', 'перші кроки', 'перші кроки в читанні'
  ],
  
  // Молодший вік (6-8 років)
  'molodshyy-6-8': [
    'молодший', 'молодша', '6-8', '7-8', 'перший клас', 'другий клас',
    'третій клас', 'початкова школа', 'школярі', 'школярки'
  ],
  
  // Середній вік (9-12 років)
  'seredniy-9-12': [
    'середній', 'середня', '9-12', '10-12', 'четвертий клас', 'п\'ятий клас',
    'шостий клас', 'підлітки', 'підліткова', 'підлітковий'
  ],
  
  // Підлітковий вік (13-16 років)
  'pidlitkovyy-13-16': [
    'підлітковий', 'підліткова', '13-16', '14-16', 'сімний клас', 'восьмий клас',
    'дев\'ятий клас', 'десятий клас', 'юнацький', 'юнацька'
  ],
  
  // Дорослі (17+ років)
  'dorosli-17-plus': [
    'дорослі', 'доросла', '17+', '18+', 'дорослий', 'зрілий', 'зріла',
    'серйозний', 'серйозна', 'філософський', 'філософська'
  ]
};

function determineAgeCategory(book) {
  const title = (book.title || '').toLowerCase();
  const description = (book.description || '').toLowerCase();
  const shortDescription = (book.short_description || '').toLowerCase();
  const category = (book.category || '').toLowerCase();
  
  const searchText = `${title} ${description} ${shortDescription} ${category}`;
  
  // Check each age category
  for (const [slug, keywords] of Object.entries(ageCategoryMapping)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return slug;
      }
    }
  }
  
  // Default to "Всі віки" if no match found
  return 'vsi-viky';
}

async function populateAgeCategories() {
  console.log('🚀 Starting age category population...\n');

  try {
    // 1. Get all age categories
    console.log('📚 Fetching age categories...');
    const { data: ageCategories, error: ageError } = await supabase
      .from('age_categories')
      .select('id, slug, name');

    if (ageError) {
      console.error('❌ Error fetching age categories:', ageError.message);
      return;
    }

    console.log(`✅ Found ${ageCategories.length} age categories`);

    // 2. Get all books
    console.log('\n📖 Fetching books...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, description, short_description, category, age_category_id')
      .neq('category', 'subscription-request');

    if (booksError) {
      console.error('❌ Error fetching books:', booksError.message);
      return;
    }

    console.log(`✅ Found ${books.length} books`);

    // 3. Create mapping from slug to ID
    const ageCategoryMap = {};
    ageCategories.forEach(cat => {
      ageCategoryMap[cat.slug] = cat.id;
    });

    // 4. Process each book
    console.log('\n🔄 Processing books...');
    let updated = 0;
    let skipped = 0;

    for (const book of books) {
      // Skip if already has age category
      if (book.age_category_id) {
        skipped++;
        continue;
      }

      const ageCategorySlug = determineAgeCategory(book);
      const ageCategoryId = ageCategoryMap[ageCategorySlug];

      if (!ageCategoryId) {
        console.warn(`⚠️  No age category found for slug: ${ageCategorySlug}`);
        continue;
      }

      // Update book with age category
      const { error: updateError } = await supabase
        .from('books')
        .update({ age_category_id: ageCategoryId })
        .eq('id', book.id);

      if (updateError) {
        console.error(`❌ Error updating book ${book.id}:`, updateError.message);
        continue;
      }

      updated++;
      console.log(`✅ Updated: "${book.title}" → ${ageCategorySlug}`);
    }

    console.log(`\n📊 Results:`);
    console.log(`   Updated: ${updated} books`);
    console.log(`   Skipped: ${skipped} books (already had age category)`);
    console.log(`   Total: ${books.length} books`);

    // 5. Verify results
    console.log('\n🔍 Verifying results...');
    const { data: booksWithAge, error: verifyError } = await supabase
      .from('books')
      .select('id, title, age_category_id')
      .neq('category', 'subscription-request')
      .not('age_category_id', 'is', null);

    if (verifyError) {
      console.error('❌ Error verifying results:', verifyError.message);
      return;
    }

    console.log(`✅ ${booksWithAge.length} books now have age categories`);

    // 6. Show distribution
    console.log('\n📈 Age category distribution:');
    const distribution = {};
    booksWithAge.forEach(book => {
      const category = ageCategories.find(cat => cat.id === book.age_category_id);
      if (category) {
        distribution[category.name] = (distribution[category.name] || 0) + 1;
      }
    });

    Object.entries(distribution).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} books`);
    });

    console.log('\n🎉 Age category population completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

populateAgeCategories();
