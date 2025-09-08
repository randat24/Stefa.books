import { NextResponse } from 'next/server';
import { fetchBooks } from '@/lib/api/books';

export async function GET(): Promise<Response> {
  try {
    // Fetch some books to test the API
    const booksResponse = await fetchBooks({ limit: 5 });
    
    return NextResponse.json({
      success: true,
      books: booksResponse.data,
      message: 'Successfully fetched books for testing'
    });
  } catch (error) {
    console.error('Error fetching books for test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch books',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}