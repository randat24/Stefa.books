import fetch from 'node-fetch'

interface BookRecord {
  id: string
  title: string
  author: string | null
}

interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo: {
      description?: string
    }
  }>
}

// Get environment variables from command line arguments
const SUPABASE_URL = process.argv[2] || process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const googleApiKey = process.argv[4] || process.env.GOOGLE_BOOKS_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env variables. Usage:')
  console.error('npx ts-node fill-book-descriptions.ts SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY [GOOGLE_BOOKS_API_KEY]')
  process.exit(1)
}

async function fetchDescriptionFromGoogle(title: string, author?: string | null): Promise<string | null> {
  // Создаем запрос, который будет искать по названию и автору книги, пробуем найти подходящее описание
  const query = `intitle:${encodeURIComponent(title)}${author ? '+inauthor:' + encodeURIComponent(author) : ''}`
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}${googleApiKey ? `&key=${googleApiKey}` : ''}&maxResults=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json() as GoogleBooksResponse
  const description = data?.items?.[0]?.volumeInfo?.description
  // Проверяем и украинские, и русские описания, и английские - любое описание длиннее 50 символов подойдет
  if (description && description.length > 50) return description.trim()
  return null
}


async function processBook(book: BookRecord) {
  console.log(`Processing: ${book.title}`)
  const description = await fetchDescriptionFromGoogle(book.title, book.author)
  if (!description) {
    console.log(`❌ No description found for "${book.title}"`)
    return
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ description })
    })
    
    if (response.ok) {
      console.log(`✅ Updated successfully: "${book.title}"`)
    } else {
      console.error(`❌ Failed to update: "${book.title}"`, await response.text())
    }
  } catch (error) {
    console.error('Error updating book:', error)
  }
}

async function main() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/books?select=id,title,author&description=is.null`, 
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch books:', await response.text())
      process.exit(1)
    }
    
    const books = await response.json() as BookRecord[]
    console.log(`Found ${books.length} books without descriptions`)
    
    for (const book of books) {
      try {
        await processBook(book)
        // simple delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000))
      } catch (e) {
        console.error('Error processing book', book.title, e)
      }
    }
    console.log('Done')
  } catch (error) {
    console.error('Error fetching books:', error)
    process.exit(1)
  }
}

main()
