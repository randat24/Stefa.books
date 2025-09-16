import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    logger.info('🧹 Starting books table cleanup...')

    // First, fetch all books to see what we have
    const { data: allBooks, error: fetchError } = await supabase
      .from('books')
      .select('id, title, author, category')
      .order('created_at', { ascending: false })

    if (fetchError) {
      logger.error('❌ Error fetching books:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch books', details: fetchError },
        { status: 500 }
      )
    }

    logger.info(`📚 Total books in table: ${allBooks.length}`)

    // Find subscription requests
    const subscriptionRequests = allBooks.filter(book =>
      book.category === 'subscription-request' ||
      book.title?.includes('Підписка') ||
      book.title?.includes('subscription') ||
      book.author?.includes('@') // Email addresses in author field suggest subscription data
    )

    logger.info(`🗑️ Found ${subscriptionRequests.length} subscription requests to remove`)

    if (subscriptionRequests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscription requests found in books table',
        totalBooks: allBooks.length,
        cleanupNeeded: false
      })
    }

    // Remove subscription requests
    const idsToDelete = subscriptionRequests.map(req => req.id)

    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) {
      logger.error('❌ Error deleting subscription requests:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete subscription requests', details: deleteError },
        { status: 500 }
      )
    }

    logger.info(`✅ Successfully deleted ${subscriptionRequests.length} subscription requests from books table`)

    // Verify cleanup
    const { data: remainingBooks, error: verifyError } = await supabase
      .from('books')
      .select('id, title, author, category')
      .order('created_at', { ascending: false })

    if (verifyError) {
      logger.error('❌ Error verifying cleanup:', verifyError)
      return NextResponse.json(
        { error: 'Failed to verify cleanup', details: verifyError },
        { status: 500 }
      )
    }

    logger.info(`📚 Books remaining after cleanup: ${remainingBooks.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up books table`,
      beforeCleanup: {
        totalBooks: allBooks.length,
        subscriptionRequests: subscriptionRequests.length
      },
      afterCleanup: {
        totalBooks: remainingBooks.length
      },
      deletedItems: subscriptionRequests.map(req => ({
        id: req.id,
        title: req.title,
        author: req.author,
        category: req.category
      })),
      remainingBooks: remainingBooks.slice(0, 5).map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category || 'none'
      }))
    })

  } catch (error) {
    logger.error('❌ Unexpected error during cleanup:', error)
    return NextResponse.json(
      { error: 'Unexpected error during cleanup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}